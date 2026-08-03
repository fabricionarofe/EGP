import axios from 'axios';

export const api = axios.create({
  // Aponta para a porta onde nosso Back-end Node.js está rodando
  baseURL: 'http://localhost:3333/api',
  // IMPORTANTÍSSIMO: Permite que o navegador salve e envie os Cookies seguros (HttpOnly) de sessão
  withCredentials: true,
});