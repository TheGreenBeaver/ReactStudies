import EndpointService from './EndpointService';

class AuthService extends EndpointService {
  constructor() {
    super('/auth');
  }

  async signIn(credentials) {
    return this.instance.post('/sign_in', credentials);
  }

  async logOut() {
    return this.instance.post('/log_out', null);
  }
}

const authService = new AuthService();
export default authService;
export { AuthService };