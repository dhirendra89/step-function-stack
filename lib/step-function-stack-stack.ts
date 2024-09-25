import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import path = require('path');
import * as sfn from 'aws-cdk-lib/aws-stepfunctions';
import * as tasks from 'aws-cdk-lib/aws-stepfunctions-tasks';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';

export class StepFunctionStackStack extends cdk.Stack {

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Resource(s)
    const lambda_function = this.greet_lambda_function(this);

    // Tasks
    const greet_job = this.greet_job(this, lambda_function);
    const succeed_job = this.succeed_job(this);

    // Tasks Chaining
    const state_machine_defintion = greet_job.next(succeed_job);

    const state_machine = this.create_state_machine(this, state_machine_defintion);
    const scheduler = this.create_rule(this);
    this.add_target(scheduler, state_machine);

  }

  greet_lambda_function(stack: cdk.Stack): lambda.Function {
    return new lambda.Function(stack, 'GreetLambda', {
      code: lambda.Code.fromAsset(path.join(__dirname, 'functions')),
      handler: 'greet_lambda.handler',
      runtime: lambda.Runtime.NODEJS_20_X,
    })
  }

  greet_job(stack: cdk.Stack, lambda_func: lambda.Function): tasks.LambdaInvoke {
    return new tasks.LambdaInvoke(stack, 'greeting_job', {
      lambdaFunction: lambda_func
    })
  }

  succeed_job(stack: cdk.Stack): sfn.Succeed {
    return new sfn.Succeed(stack, 'Succeed');
  }

  create_state_machine(stack: cdk.Stack, sm_definition: sfn.Chain): sfn.StateMachine {
    return new sfn.StateMachine(stack, 'GreetStateMachine', {
      definitionBody: sfn.DefinitionBody.fromChainable(sm_definition),
      stateMachineName: 'GreetWorldStepFunction',
      stateMachineType: sfn.StateMachineType.STANDARD
    })
  }

  create_rule(stack: cdk.Stack) {
    return new events.Rule(stack, 'StepFunctionScheduler', {
      schedule: events.Schedule.rate(cdk.Duration.minutes(1)),
      enabled: true
    })
  }

  add_target(rule: events.Rule, state_machine: sfn.StateMachine) {
    rule.addTarget(new targets.SfnStateMachine(state_machine));
  }

}
