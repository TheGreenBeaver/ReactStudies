import EndpointService from './EndpointService';


class UsersService extends EndpointService {
  constructor() {
    super('/users');
  }

  async me() {
    return this.instance.get('/me');
  }

  async verify(uid, token) {
    return this.instance.post('/verify', { uid, token });
  }
}

const usersService = new UsersService();

export default usersService;
export { UsersService };