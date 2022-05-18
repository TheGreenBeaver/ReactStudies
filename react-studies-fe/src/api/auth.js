import ApiService from './index';

class AuthService extends ApiService {
  constructor() {
    super('/auth', false);
  }

  async signIn({ email, password }) {
    return this.instance.post('/sign_in', { email, password });
  }

  async logOut() {
    return this.instance.post('/log_out', null, this.withAuth());
  }
}

const authService = new AuthService();
export default authService;
export { AuthService };