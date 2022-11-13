import {buildTestContext, buildTestEvent} from "../utils.test";
import {buildCfnResponse, buildLogStreamUrl} from "../../src/requestBuilder";
import {CustomResourceResult} from "../../src/model";
import {CloudFormationCustomResourceEvent, Context} from "aws-lambda";

describe('Cloudformation client should build response', () => {

    it('for success', async () => {
        // GIVEN
        const context = buildTestContext()
        const event = buildTestEvent()
        const cfResult: CustomResourceResult = {
            PhysicalResourceId: "arn::some-resource-id",
            Status: "SUCCESS"
        }

        // WHEN
        const result = buildCfnResponse(event, context, cfResult)

        // THEN
        expect(result).toEqual({
            LogicalResourceId: "CreateUserResource",
            PhysicalResourceId: "arn::some-resource-id",
            Reason: "\nFull logs: https://us-east-1.console.aws.amazon.com/cloudwatch/home?region=us-east-1#logsV2:log-groups/log-group/$252Faws$252Flambda$252FsomeFunctionName/log-events/2022$252F10$252F16$252F$255B$2524LATEST$255D52cecb1f3df24885bc0ed01354bceef0",
            RequestId: "some-request-uuid",
            StackId: "arn:aws:cloudformation:us-east-1:123456789:stack/stackName/someUUID",
            Status: "SUCCESS"
        })
    })

    it('for failed', async () => {
        // GIVEN
        const context = buildTestContext()
        const event = buildTestEvent()
        const cfResult: CustomResourceResult = {
            PhysicalResourceId: "arn::some-resource-id",
            Status: "FAILED"
        }

        // WHEN
        const result = await buildCfnResponse(event, context, cfResult)

        // THEN
        expect(result).toEqual({
            LogicalResourceId: "CreateUserResource",
            PhysicalResourceId: "arn::some-resource-id",
            Reason: "\nFull logs: https://us-east-1.console.aws.amazon.com/cloudwatch/home?region=us-east-1#logsV2:log-groups/log-group/$252Faws$252Flambda$252FsomeFunctionName/log-events/2022$252F10$252F16$252F$255B$2524LATEST$255D52cecb1f3df24885bc0ed01354bceef0",
            RequestId: "some-request-uuid",
            StackId: "arn:aws:cloudformation:us-east-1:123456789:stack/stackName/someUUID",
            Status: "FAILED"
        })
    })

    it('for failed without physical resource id', async () => {
        // GIVEN
        const context = buildTestContext()
        const event = buildTestEvent()
        const cfResult: CustomResourceResult = {
            Status: "FAILED"
        }

        // WHEN
        const result = await buildCfnResponse(event, context, cfResult)

        // THEN
        expect(result).toEqual({
            LogicalResourceId: "CreateUserResource",
            PhysicalResourceId: "customResource::creation-failed:CreateUserResource",
            Reason: "\nFull logs: https://us-east-1.console.aws.amazon.com/cloudwatch/home?region=us-east-1#logsV2:log-groups/log-group/$252Faws$252Flambda$252FsomeFunctionName/log-events/2022$252F10$252F16$252F$255B$2524LATEST$255D52cecb1f3df24885bc0ed01354bceef0",
            RequestId: "some-request-uuid",
            StackId: "arn:aws:cloudformation:us-east-1:123456789:stack/stackName/someUUID",
            Status: "FAILED"
        })
    })

    it('for failed with reason', async () => {
        // GIVEN
        const context = buildTestContext()
        const event = buildTestEvent()
        const cfResult: CustomResourceResult = {
            PhysicalResourceId: "arn::some-resource-id",
            Status: "FAILED",
            Reason: "Some test reason"
        }

        // WHEN
        const result = await buildCfnResponse(event, context, cfResult)

        // THEN
        expect(result).toEqual({
            LogicalResourceId: "CreateUserResource",
            PhysicalResourceId: "arn::some-resource-id",
            Reason: "Some test reason\nFull logs: https://us-east-1.console.aws.amazon.com/cloudwatch/home?region=us-east-1#logsV2:log-groups/log-group/$252Faws$252Flambda$252FsomeFunctionName/log-events/2022$252F10$252F16$252F$255B$2524LATEST$255D52cecb1f3df24885bc0ed01354bceef0",
            RequestId: "some-request-uuid",
            StackId: "arn:aws:cloudformation:us-east-1:123456789:stack/stackName/someUUID",
            Status: "FAILED"
        })
    })

    it('for delete of resource that failed to create', async () => {
        // GIVEN
        const context = buildTestContext()
        const event: CloudFormationCustomResourceEvent = {
            RequestType: 'Delete',
            ServiceToken: 'arn:aws:lambda:us-east-1:123456789:function:someFunctionName',
            ResponseURL: 'https://cloudformation-custom-resource-response-useast1.s3.amazonaws.com/blahblahblah',
            StackId: 'arn:aws:cloudformation:us-east-1:123456789:stack/stackName/someUUID',
            RequestId: 'some-request-uuid',
            LogicalResourceId: 'CreateUserResource',
            ResourceType: 'Custom::SomeResource',
            PhysicalResourceId: "customResource::creation-failed:CreateUserResource",
            ResourceProperties: {
                ServiceToken: 'arn:aws:lambda:us-east-1:123456789:function:someFunctionName',
            }
        }
        const cfResult: CustomResourceResult = {
            PhysicalResourceId: "customResource::creation-failed:CreateUserResource",
            Status: "FAILED",
            Reason: "Some test reason"
        }

        // WHEN
        const result = await buildCfnResponse(event, context, cfResult)

        // THEN
        expect(result).toEqual({
            LogicalResourceId: "CreateUserResource",
            PhysicalResourceId: "customResource::creation-failed:CreateUserResource",
            Reason: "Some test reason\nFull logs: https://us-east-1.console.aws.amazon.com/cloudwatch/home?region=us-east-1#logsV2:log-groups/log-group/$252Faws$252Flambda$252FsomeFunctionName/log-events/2022$252F10$252F16$252F$255B$2524LATEST$255D52cecb1f3df24885bc0ed01354bceef0",
            RequestId: "some-request-uuid",
            StackId: "arn:aws:cloudformation:us-east-1:123456789:stack/stackName/someUUID",
            Status: "SUCCESS"
        })
    })
})

describe('URL Builder', function () {
    it('should correctly generate log stream url', async () => {
        // GIVEN
        const context: Context = buildTestContext()

        // WHEN
        const result = buildLogStreamUrl(context);

        // THEN
        expect(result).toBe("https://us-east-1.console.aws.amazon.com/cloudwatch/home?region=us-east-1#logsV2:log-groups/log-group/$252Faws$252Flambda$252FsomeFunctionName/log-events/2022$252F10$252F16$252F$255B$2524LATEST$255D52cecb1f3df24885bc0ed01354bceef0")
    });
});