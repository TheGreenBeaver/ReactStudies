import axios from 'axios';
import { getVar, isDev } from '../util/env';
import { getAuthHeaders } from '../util/auth';


class ApiService {
  constructor(endpoint, ensureAuth = true) {
    const host = isDev() ? getVar('REACT_APP_HOST') : window.location.origin;
    const apiRoot = '/api';
    const options = { baseURL: `${host}${apiRoot}${endpoint}` };
    if (ensureAuth) {
      options.headers = getAuthHeaders();
    }
    this.instance = axios.create(options);
  }

  withAuth(options = {}) {
    return {
      ...options,
      headers: getAuthHeaders(options.headers)
    };
  }

  async get(id, options) {
    return this.instance.get(`/${id}`, options);
  }

  async list(options) {
    return this.instance.get('/', options);
  }

  async create(data, options) {
    return this.instance.post('/', data, options);
  }

  async update(id, data, options) {
    return this.instance.patch(`/${id}`, data, options);
  }

  async delete(id, options) {
    return this.instance.delete(`/${id}`, options);
  }
}

export default ApiService;