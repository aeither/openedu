
import { createLogger } from '@mastra/core/logger';
import { Mastra } from '@mastra/core/mastra';
import { agents } from './agents';
import { workflows } from './workflows';

export const mastra = new Mastra({
  workflows: workflows,
  agents: agents,
  logger: createLogger({
    name: 'Mastra',
    level: 'info',
  }),
});
