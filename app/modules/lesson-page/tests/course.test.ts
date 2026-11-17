import { describe, it, expect } from "vitest";
import { flattenCourseLessons } from "../course.server";

describe("flattenCourseLessons", () => {
  it("lists every lesson in module order, labelled with its module", () => {
    const course = {
      modules: [
        {
          id: 1,
          title: "Basics",
          lessons: [
            { id: 10, title: "Types", moduleId: 1 },
            { id: 11, title: "Interfaces", moduleId: 1 },
          ],
        },
        {
          id: 2,
          title: "Generics",
          lessons: [{ id: 20, title: "Type parameters", moduleId: 2 }],
        },
      ],
    };

    expect(flattenCourseLessons(course)).toEqual([
      { id: 10, title: "Types", moduleId: 1, moduleTitle: "Basics" },
      { id: 11, title: "Interfaces", moduleId: 1, moduleTitle: "Basics" },
      {
        id: 20,
        title: "Type parameters",
        moduleId: 2,
        moduleTitle: "Generics",
      },
    ]);
  });

  it("skips modules with no lessons", () => {
    const course = {
      modules: [
        { id: 1, title: "Empty", lessons: [] },
        {
          id: 2,
          title: "Full",
          lessons: [{ id: 5, title: "Only lesson", moduleId: 2 }],
        },
      ],
    };

    expect(flattenCourseLessons(course)).toEqual([
      { id: 5, title: "Only lesson", moduleId: 2, moduleTitle: "Full" },
    ]);
  });
});
