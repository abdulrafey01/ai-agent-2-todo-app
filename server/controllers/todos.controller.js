import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  createTodo,
  deleteTodo,
  getAllTodos,
  searchTodos,
} from "../db/functions.js";

import {
  getTodosFunctionDeclarations,
  createTodoFunctionDeclarations,
  deleteTodoFunctionDeclarations,
  searchTodosFunctionDeclarations,
} from "../lib/gptDeclarations.js";

// Executable function code. Put it in a map keyed by the function name
// so that you can call it once you get the name string from the model.
const functions = {
  getAllTodos,
  createTodo,
  deleteTodo,
  searchTodos,
};

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  systemInstruction: `You are a todo list manager. You are responsible for managing a todo list based on the user's request. The response you give will be used to manage the todo list. You should always talk in human language, not in code.

  Available functions are:
    getAllTodos(): Get all todos,
    createTodo({todo: string}): Create a todo,
    deleteTodo({id: number}): Delete a todo with id parameter,
    searchTodos({query: string}): Search for a todo with query parameter.
  
  When user wants to add a todo, use createTodo function.
  When user wants to delete a todo, use deleteTodo function.
  When user wants to search todos, use searchTodos function.
  When user wants to see all todos, use getAllTodos function.
  When user wants to delete todo based on id, use deleteTodo function.
  When user wants to delete todo based on some text, first search for the todo using searchTodos function and then use deleteTodo function to delete it.
  When user wants to do multiple things, call the functions one by one.
  `,
  tools: {
    functionDeclarations: [
      getTodosFunctionDeclarations,
      createTodoFunctionDeclarations,
      deleteTodoFunctionDeclarations,
      searchTodosFunctionDeclarations,
    ],
  },
});

export const todosController = async (req, res) => {
  try {
    if (!req.body.message) {
      return res.status(400).json({
        message: "Message is required in the request body",
      });
    }
    const { message } = req.body;

    const chat = model.startChat({
      history: req.body.history,
    });

    let result = await chat.sendMessage(message);
    let calls = result.response.functionCalls();
    console.log("calls", calls);
    if (calls?.length > 0) {
      while (true) {
        const records = [];
        for (const call of calls) {
          try {
            const selectedFunction = functions[call.name];
            if (!selectedFunction) {
              throw new Error(`Function ${call.name} not found`);
            }

            const functionResponse = await selectedFunction({ ...call.args });
            records.push(functionResponse);
          } catch (functionError) {
            console.error(
              `Error executing function ${call.name}:`,
              functionError
            );
            throw new Error(
              `Failed to execute ${call.name}: ${functionError.message}`
            );
          }
        }

        // Send all function responses together
        const functionResponses = calls.map((call, index) => ({
          functionResponse: {
            name: call.name,
            response: { functionResponse: records[index] },
          },
        }));

        result = await chat.sendMessage(functionResponses);
        if (result.response.functionCalls()?.length > 0) {
          calls = result.response.functionCalls();
          continue;
        } else {
          break;
        }
      }

      // Get the latest todo list after any operation
      const latestTodos = await getAllTodos();

      res.status(200).json({
        message: result.response.text(),
        todos: latestTodos,
      });
    } else {
      // Even for non-function calls, return the current todo list
      const latestTodos = await getAllTodos();
      res.status(200).json({
        message: result.response.text(),
        todos: latestTodos,
      });
    }
  } catch (error) {
    console.log("error", error);
    res.status(500).json({
      message: error.message,
    });
  }
};
