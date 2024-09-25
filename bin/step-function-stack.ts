import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { StepFunctionStackStack } from '../lib/step-function-stack-stack';

const app = new cdk.App();
new StepFunctionStackStack(app, 'StepFunctionStackStack', {
  env: { account: '011528282778', region: 'ap-south-1' },
});