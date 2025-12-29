"use client";

import React, { ReactNode, ReactElement } from "react";

interface IGridProps {
  children: ReactNode;
}

export default function Grid({ children }: IGridProps): ReactElement {
  return (
    <section className="container">
      <div className="row">
        {React.Children.map(children, (child) => {
          return child;
        })}
      </div>
    </section>
  );
}