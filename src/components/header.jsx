import React from "react";

export const Header = (props) => {
  return (
    <header id="header">
      <div className="intro">
        <div className="overlay">
          <div className="container">
            <div className="row">
              <div className="col-md-8 col-md-offset-2 intro-text">
                <h1>
                  {props.data ? props.data.title : "Loading"}
                  <span></span>
                </h1>
                <p>{props.data ? props.data.paragraph : "Loading"}</p>
                <a
                  href="docs/_build/html/index.html"
                  className="btn btn-custom btn-lg page-scroll"
                >
                  Quick Start
                </a>{" "}
                <a
                  href="https://github.com/epfl-dlab/multi-level-reasoning-for-code"
                  className="btn btn-custom btn-lg page-scroll"
                >
                  Github repo
                </a>{" "}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
