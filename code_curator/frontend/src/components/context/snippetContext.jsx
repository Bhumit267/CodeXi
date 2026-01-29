import React, { createContext, useState, useContext } from 'react';
import axios from 'axios';

const SnippetContext = createContext();

export const useSnippet = () => useContext(SnippetContext);

export const SnippetProvider = ({ children }) => {
  const [snippets, setSnippets] = useState([]);
  const accessToken = localStorage.getItem("accessToken");
  const refreshToken = localStorage.getItem("refreshToken");

  const fetchSnippets = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/snippets/user`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setSnippets(response.data.snippets);
    } catch (error) {
      console.error('Error fetching snippets:', error);
      throw error;
    }
  };

  const createSnippet = async (snippetData) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/snippets/create`, snippetData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setSnippets([response.data.snippet, ...snippets]);
      return response.data.snippet;
    } catch (error) {
      console.error('Error creating snippet:', error);
      throw error;
    }
  };

  const updateSnippet = async (id, snippetData) => {
    try {
      const response = await axios.put(`${import.meta.env.VITE_BASE_URL}/snippets/${id}`, snippetData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setSnippets(snippets.map(snippet => 
        snippet._id === id ? response.data.snippet : snippet
      ));
      return response.data.snippet;
    } catch (error) {
      console.error('Error updating snippet:', error);
      throw error;
    }
  };

  const getSnippetById = async (id) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/snippets/${id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response.data.snippet;
    } catch (error) {
      console.error('Error fetching snippet:', error);
      throw error;
    }
  };

  const deleteSnippet = async (id) => {
    try {
      await axios.delete(`${import.meta.env.VITE_BASE_URL}/snippets/${id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setSnippets(snippets.filter(snippet => snippet._id !== id));
    } catch (error) {
      console.error('Error deleting snippet:', error);
      throw error;
    }
  };

  return (
    <SnippetContext.Provider value={{ 
      snippets, 
      fetchSnippets, 
      createSnippet, 
      updateSnippet, 
      getSnippetById,
      deleteSnippet 
    }}>
      {children}
    </SnippetContext.Provider>
  );
};
