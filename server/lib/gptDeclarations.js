const getTodosFunctionDeclarations = {
  name: "getAllTodos",
  parameters: {
    type: "OBJECT",
    description: "Get all todos",
    properties: {
      id: { type: "INTEGER", description: "The id of the todo to get" },
    },
  },
};

const createTodoFunctionDeclarations = {
  name: "createTodo",
  parameters: {
    type: "OBJECT",
    description: "Create a new todo from the user's message",
    properties: {
      todo: {
        type: "STRING",
        description: "The todo text content",
      },
    },
    required: ["todo"],
  },
};

const deleteTodoFunctionDeclarations = {
  name: "deleteTodo",
  parameters: {
    type: "OBJECT",
    description: "Delete a todo",
    properties: {
      id: {
        type: "INTEGER",
        description: "The id of the todo to delete",
      },
    },
    required: ["id"],
  },
};

const searchTodosFunctionDeclarations = {
  name: "searchTodos",
  parameters: {
    type: "OBJECT",
    description: "Search for todos based on the text query",
    properties: {
      query: {
        type: "STRING",
        description: "The Text query to search for",
      },
    },
  },
};

export {
  getTodosFunctionDeclarations,
  createTodoFunctionDeclarations,
  deleteTodoFunctionDeclarations,
  searchTodosFunctionDeclarations,
};
