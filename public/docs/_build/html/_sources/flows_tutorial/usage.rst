===============
Usage of FLOWS
===============

To create a Flow, you start by defining a class that inherits from the ``src.flows.Flow`` class. This class serves as the blueprint for your conversation flow and provides a framework for orchestrating interactions between agents.

Once you have defined your Flow class, you can override the ``_flow`` method to implement the specific logic and behavior of your conversation flow. This method will be called when the Flow is executed. Within the ``_flow`` method, you have access to the conversation's state, message history, and other relevant data.

In the example provided, we have a ``DirectCodingFlow`` class that inherits from a base ``CodingFlow``. This flow is designed to solve coding questions. It utilizes the ``code_agent`` to generate code based on a problem statement and stores the resulting code in its state.

The ``DirectCodingFlow`` class also allows for the inclusion of optional agents, such as code_fixing_agent and code_testing_agent. If these agents are provided, the flow enters a code fixing loop. In this loop, the code fixing agent or code testing agent are invoked to provide feedback on the generated code. The feedback is then incorporated into the conversation flow, allowing for iterative improvements to the code.

To use the Flow, you need to instantiate an instance of your defined class and provide the necessary agents and any additional configuration. In the example, the ``DirectCodingFlow`` expects a ``code_agent`` to generate code. The ``code_fixing_agent`` and ``code_testing_agent`` are optional and can be included if available.

Finally, you can use the ``src.models.FlowAPIModel`` to interact with the Flow. This model takes a list of Flows or a single Flow as an argument. It provides a convenient interface to call the OpenAI API according to the interaction scheme defined in the Flow. The model handles the coordination and sequencing of agent turns, message routing, and maintains the conversation history.

.. code-block:: python

    class DirectCodingFlow(CodingFlow):
    def __init__(self, agents: Dict[str, Agent], debugging_setup: Union[Dict, None] = None):

        super().__init__()

        self.debugging_setup = debugging_setup

        assert "code_agent" in agents, "The DirectCodingFlow expects a agent named `code_agent`."
        self.code_agent = agents.get("code_agent", None)

        self.code_fixing_agent = agents.get("code_fixing_agent", None)
        self.code_testing_agent = agents.get("code_testing_agent", None)

    def _flow(self, sample: Dict, api_key: str, dry_run: bool = False):
        conversation_id = create_unique_id(self.message_history.conversation_ids)

        agent_result = self.code_agent(
            task_data=self.state,
            message_history=self.message_history,
            conversation_id=conversation_id,
            initialize_conversation=True,
            api_key=api_key,
            dry_run=dry_run,
        )

        self._update_state(
            self.message_history,
            parents=[agent_result["response_message"].message_id],
            keys_to_update=None,
            **agent_result["response_message"].metadata,
        )

        if "code" not in self.state or self.state["code"]["value"] is None:
            self._update_state(self.message_history, code="Not available.")
            log.error(f"[Problem {self.state['id']['value']}] " "The code generation loop did not produced code.")
            return

        # Testing and fixing the code
        if self.code_fixing_agent and self.code_testing_agent:
            self._code_fixing_loop(api_key=api_key, dry_run=dry_run)

    