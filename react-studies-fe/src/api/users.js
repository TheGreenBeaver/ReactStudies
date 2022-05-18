import ApiService from './index';

class UsersService extends ApiService {
  constructor() {
    super('/users', false);
  }

  async me() {
    return this.instance.get('/me', this.withAuth());
  }


  async verify(uid, token) {
    return this.instance.post('/verify', { uid, token });
  }
}

const usersService = new UsersService();

export default usersService;
export { UsersService };