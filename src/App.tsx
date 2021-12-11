import React, { useState, useEffect } from 'react';
import Amplify, { API, graphqlOperation } from 'aws-amplify';
import { createNote as createNoteMutation, deleteNote as deleteNoteMutation } from './graphql/mutations';
import { listNotes } from './graphql/queries';
import { ListNotesQuery, CreateNoteInput } from './API';
import { GraphQLResult } from '@aws-amplify/api';

import logo from './logo.svg';
import './App.css';

import awsExports from './aws-exports';
Amplify.configure(awsExports);

const initialFormState = { name: '', description: '' };

function App() {
  const [notes, setNotes] = useState<CreateNoteInput[]>([]);
  const [formState, setFormState] = useState(initialFormState);

  useEffect(() => {
    fetchNotes();
  }, []);

  const setInput = (key: string, value: string) => {
    setFormState({ ...formState, [key]: value });
  };

  async function fetchNotes() {
    const apiData = await API.graphql({ query: listNotes }) as GraphQLResult<ListNotesQuery>;
    if (apiData.data?.listNotes?.items) {
      const notes = apiData.data.listNotes.items as CreateNoteInput[];
      setNotes(notes);
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
      </header>
      <div>
        <h1>React Memo</h1>
        <input
          onChange={(event) => setInput('name', event.target.value)}
          placeholder="name"
          value={formState.name}
        />
        <input
          onChange={(event) => setInput('description', event.target.value)}
          placeholder="description"
          value={formState.description}
        />
        <button>Create Note</button>
        <div style={{marginBottom: 30}}>
          {
            notes.map(note => (
              <div key={note.id || note.name}>
                <h2>{note.name}</h2>
                <p>{note.description}</p>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
}

export default App;
