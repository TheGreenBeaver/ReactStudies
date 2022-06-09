const { Webhooks, createNodeMiddleware } = require('@octokit/webhooks');
const { getVar } = require('../util/env');
const { WEBHOOKS_PATH, TEMP_DIR } = require('../settings');
const { Solution, User, Task, LayoutSolutionResult, LayoutTask, ReactTask } = require('../models');
const { User_Private, Any_Dummy } = require('../util/query-options');
const pick = require('lodash/pick');
const { downloadArtifacts } = require('../util/github');
const path = require('path');
const now = require('lodash/now');


function apply(app) {
  const webhooks = new Webhooks({
    secret: getVar('WEBHOOKS_SECRET'),
  });

  const { wsServer } = app.locals;

  webhooks.on('workflow_run.completed', async ({ payload }) => {
    const { workflow_run , repository, workflow } = payload;
    const solution = await Solution.findOne({
      where: { repoId: repository.id },
      include: [{
        model: User, as: 'student', ...User_Private
      }, {
        model: Task, as: 'task', ...Any_Dummy,
        include: [{
          model: LayoutTask,
          as: 'layoutTask'
        }, {
          model: ReactTask,
          as: 'reactTask'
        }]
      }],
      attributes: ['id', 'repoUrl']
    });
    const [solutionKind] = workflow.name.split('-');

    const tokenIsSaved = !!solution.student.gitHubToken;
    const tempDest = path.join(TEMP_DIR, `${now()}.zip`);
    const values = tokenIsSaved ? {} : { unprocessedReportLocation: tempDest };
    let solutionResult;
    switch (solutionKind) {
      case Task.TASK_KINDS.layout:
        solutionResult = LayoutSolutionResult.build({ ...values, solution_id: solution.id });
        break;
      case Task.TASK_KINDS.react:
      // TODO
    }
    if (tokenIsSaved) {
      await downloadArtifacts(
        solution.student.gitHubToken,
        repository.owner.login,
        repository.name,
        workflow_run.id,
        wsServer,
        solutionResult,
        solution,
        tempDest
      );
    } else {
      wsServer.sendToUser(solution.student, wsServer.Actions.workflowCompleted, pick(solution, ['id', 'repoUrl']));

      solution.awaitingToken = true;
      await solution.save();

      solutionResult.runId = workflow_run.id;
      await solutionResult.save();
    }
  });

  const mw = createNodeMiddleware(webhooks, { path: '/' });
  app.use(WEBHOOKS_PATH, mw);
}

module.exports = apply;
