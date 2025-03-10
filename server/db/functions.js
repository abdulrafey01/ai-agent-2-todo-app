import { eq, ilike } from "drizzle-orm";
import { db } from "./index.js";
import { todosTable } from "./schema.js";

export const getAllTodos = async (obj) => {
  // continue
  const todos = await db.select().from(todosTable);
  // .where(eq(todosTable.id, obj.id));
  // [todos] <- this syntax is called array destructuring and is same as:
  // const results = await db.select().from(todosTable);
  // const todos = results[0];
  // console.log("todos", todos);
  return todos;
};

export const createTodo = async (todo) => {
  const newTodo = await db.insert(todosTable).values(todo).returning();
  return newTodo[0];
};

export const searchTodos = async ({ query }) => {
  const todos = await db
    .select()
    .from(todosTable)
    .where(ilike(todosTable.todo, `%${query}%`));
  return todos;
};

export const deleteTodo = async (obj) => {
  const deletedTodo = await db
    .delete(todosTable)
    .where(eq(todosTable.id, obj.id))
    .returning();
  return deletedTodo[0];
};
