import EndpointService from './EndpointService';


class SolutionResultsService extends EndpointService {
  constructor() {
    super('/solution_results');
  }
}

const solutionResultsService = new SolutionResultsService();
export default solutionResultsService;
export { SolutionResultsService };