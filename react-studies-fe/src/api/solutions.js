import ApiService from './index';

class SolutionsService extends ApiService {
  constructor() {
    super('/solutions');
  }
}

const solutionsService = new SolutionsService();
export default solutionsService;
export { SolutionsService };