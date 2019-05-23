import { Component } from "@stencil/core";

@Component({
  tag: "app-root",
  styleUrl: "app-root.css",
  shadow: true
})
export class AppRoot {
  render() {
    return (
      <div>
        <main>
          <app-home />
        </main>
      </div>
    );
  }
}
