import EndpointService from './EndpointService';


class SolutionsService extends EndpointService {
  constructor() {
    super('/solutions');
  }
}

const solutionsService = new SolutionsService();
export default solutionsService;
export { SolutionsService };