import React, { useEffect, useState } from "react";
import Amplify, { API, graphqlOperation } from "aws-amplify";
import {
  createNote as createNoteMutation,
  deleteNote as deleteNoteMutation,
} from "./graphql/mutations";
import { listNotes } from "./graphql/queries";

import { ListNotesQuery, CreateNoteInput, DeleteNoteInput } from "./API";

import "./App.css";

import awsExports from "./aws-exports";
import { GraphQLResult } from "@aws-amplify/api";
Amplify.configure(awsExports);

const initialState = { name: "", description: "" };

const App: React.VFC = () => {
  const [formState, setFormState] = useState(initialState);
  const [notes, setNotes] = useState<CreateNoteInput[]>([]);

  useEffect(() => {
    fetchNotes();
  }, []);

  const setInput = (key: string, value: string) => {
    setFormState({ ...formState, [key]: value });
  };

  const fetchNotes = async () => {
    try {
      const noteData = (await API.graphql(
        graphqlOperation(listNotes)
      )) as GraphQLResult<ListNotesQuery>;
      if (noteData.data?.listNotes?.items) {
        const notes = noteData.data.listNotes.items as CreateNoteInput[];
        setNotes(notes);
      }
    } catch (err) {
      console.log("error fetching notes");
    }
  };

  const addNote = async () => {
    try {
      if (!formState.name || !formState.description) return;
      const note: CreateNoteInput = { ...formState };
      setNotes([...notes, note]);
      setFormState(initialState);
      (await API.graphql(
        graphqlOperation(createNoteMutation, { input: note })
      )) as GraphQLResult<CreateNoteInput>;
    } catch (err) {
      console.log("error creating note:", err);
    }
  };

  const deleteNote = async (id: string) => {
    try {
      const deleteNote: DeleteNoteInput = { id };
      const newNotesArray = notes.filter((note) => note.id !== id);
      setNotes(newNotesArray);
      (await API.graphql(
        graphqlOperation(deleteNoteMutation, { input: deleteNote })
      )) as GraphQLResult<DeleteNoteInput>;
    } catch (err) {
      console.log("error deleting note:", err);
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
      {notes.map((note, index) => (
        <div key={note.id ? note.id : index} style={styles.note}>
          <h2 style={styles.noteName}>{note.name}</h2>
          <p style={styles.noteDesctiption}>{note.description}</p>
          <button onClick={() => deleteNote(note.id as string)}>Delete</button>
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
