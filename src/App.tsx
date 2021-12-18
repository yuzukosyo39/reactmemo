import React, { useEffect, useState } from "react";
import Amplify, { API, graphqlOperation } from "aws-amplify";
import { createNote } from "./graphql/mutations";
import { listNotes } from "./graphql/queries";

import { ListNotesQuery, CreateNoteInput } from "./API";

import "./App.css";

import awsExports from "./aws-exports";
import { GraphQLResult } from "@aws-amplify/api";
Amplify.configure(awsExports);

const initialState = { name: "", description: "" };

const App: React.VFC = () => {
  const [formState, setFormState] = useState(initialState);
  const [todos, setTodos] = useState<CreateNoteInput[]>([]);

  useEffect(() => {
    fetchTodos();
  }, []);

  const setInput = (key: string, value: string) => {
    setFormState({ ...formState, [key]: value });
  };

  const fetchTodos = async () => {
    try {
      const todoData = (await API.graphql(
        graphqlOperation(listNotes)
      )) as GraphQLResult<ListNotesQuery>;
      if (todoData.data?.listNotes?.items) {
        const todos = todoData.data.listNotes.items as CreateNoteInput[];
        setTodos(todos);
      }
    } catch (err) {
      console.log("error fetching todos");
    }
  };

  const addNote = async () => {
    try {
      if (!formState.name || !formState.description) return;
      const todo: CreateNoteInput = { ...formState };
      setTodos([...todos, todo]);
      setFormState(initialState);
      (await API.graphql(
        graphqlOperation(createNote, { input: todo })
      )) as GraphQLResult<CreateNoteInput>;
    } catch (err) {
      console.log("error creating todo:", err);
    }
  };

  return (
    <div style={styles.container}>
      <h2>React Memo</h2>
      <input
        onChange={(event) => setInput("name", event.target.value)}
        style={styles.input}
        value={formState.name}
        placeholder="Name"
      />
      <input
        onChange={(event) => setInput("description", event.target.value)}
        style={styles.input}
        value={formState.description}
        placeholder="Description"
      />
      <button style={styles.button} onClick={addNote}>
        Create Note
      </button>
      {todos.map((todo, index) => (
        <div key={todo.id ? todo.id : index} style={styles.note}>
          <h2 style={styles.noteName}>{todo.name}</h2>
          <p style={styles.noteDesctiption}>{todo.description}</p>
        </div>
      ))}
    </div>
  );
};

const styles: {
  [key: string]: React.CSSProperties;
} = {
  container: {},
  todo: {},
  input: {},
  noteName: {},
  noteDescription: {},
  button: {},
};

export default App;
