import {CloudFormationCustomResourceEvent, Context} from "aws-lambda";

export const buildTestContext = (): Context => {
    return {
        callbackWaitsForEmptyEventLoop: false,
        succeed: jest.fn(),
        fail: jest.fn(),
        done: jest.fn(),
        functionVersion: '$LATEST',
        functionName: 'someFunctionName',
        memoryLimitInMB: '128',
        logGroupName: '/aws/lambda/someFunctionName',
        logStreamName: '2022/10/16/[$LATEST]52cecb1f3df24885bc0ed01354bceef0',
        clientContext: undefined,
        identity: undefined,
        invokedFunctionArn: 'arn:aws:lambda:us-east-1:123456789:function:someFunctionName',
        awsRequestId: 'c0042ef4-6f64-48d4-874f-c1ce0072b32f',
        getRemainingTimeInMillis: jest.fn()
    };
}

export const buildTestEvent = (): CloudFormationCustomResourceEvent => {
    return {
        RequestType: 'Create',
        ServiceToken: 'arn:aws:lambda:us-east-1:123456789:function:someFunctionName',
        ResponseURL: 'https://cloudformation-custom-resource-response-useast1.s3.amazonaws.com/blahblahblah',
        StackId: 'arn:aws:cloudformation:us-east-1:123456789:stack/stackName/someUUID',
        RequestId: 'some-request-uuid',
        LogicalResourceId: 'CreateUserResource',
        ResourceType: 'Custom::SomeResource',
        ResourceProperties: {
            ServiceToken: 'arn:aws:lambda:us-east-1:123456789:function:someFunctionName',
        }
    }
}