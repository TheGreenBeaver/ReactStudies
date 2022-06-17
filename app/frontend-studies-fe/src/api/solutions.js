import EndpointService from './EndpointService';


class SolutionsService extends EndpointService {
  constructor() {
    super('/solutions');
  }

  async sendUrgentToken(values) {
    return this.instance.post('/urgent_token', values);
  }
}

const solutionsService = new SolutionsService();
export default solutionsService;
export { SolutionsService };