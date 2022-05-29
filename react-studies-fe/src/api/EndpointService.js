import axios from 'axios';
import { getVar, isDev } from '../util/env';
import { getCredentials, getIsAuthorized } from '../util/auth';


class EndpointService {
  static API_ROOT = '/api';

  constructor(endpoint) {
    const origin = isDev ? getVar('REACT_APP_ORIGIN') : window.location.origin;
    const options = { baseURL: `${origin}${EndpointService.API_ROOT}${endpoint}` };
    if (getIsAuthorized()) {
      options.headers = { Authorization: `Token ${getCredentials()}` };
    }
    this.instance = axios.create(options);
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(this));
    methods.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  addErrorHandler(handler) {
    this.instance.interceptors.response.use(response => response, handler);
  }

  authorize(token) {
    this.instance.defaults.headers.common.Authorization = `Token ${token}`;
  }

  unAuthorize() {
    delete this.instance.defaults.headers.common.Authorization;
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

export default EndpointService