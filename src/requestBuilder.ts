import {CloudFormationCustomResourceEvent, CloudFormationCustomResourceResponse, Context} from "aws-lambda";
import {CustomResourceResult} from "./model.js";

const createFailedMessage = "customResource::creation-failed"

export function buildCfnResponse(event: CloudFormationCustomResourceEvent,
                                 context: Context,
                                 cfResult: CustomResourceResult): CloudFormationCustomResourceResponse {
    return {
        Status: getStatus(event, cfResult.Status),
        Reason: `${cfResult.Reason || ''}\nFull logs: ${buildLogStreamUrl(context)}`,
        PhysicalResourceId: cfResult.PhysicalResourceId || buildPhysicalResourceId(event, context),
        StackId: event.StackId,
        RequestId: event.RequestId,
        LogicalResourceId: event.LogicalResourceId,
        NoEcho: cfResult.NoEcho,
        Data: cfResult.Data
    }
}

function buildPhysicalResourceId(event: CloudFormationCustomResourceEvent, context: Context) {
    return event.RequestType !== "Create" ? event.PhysicalResourceId : `${createFailedMessage}:${event.LogicalResourceId}`
}

function getStatus(event: CloudFormationCustomResourceEvent, status: "SUCCESS" | "FAILED"): "SUCCESS" | "FAILED" {
    if (event.RequestType === "Delete" && status === "FAILED" && event.PhysicalResourceId?.startsWith(createFailedMessage)) {
        return "SUCCESS"
    }

    return status
}

export function buildLogStreamUrl(context: Context) {
    const region = extractRegion(context);
    return `https://${region}.console.aws.amazon.com/cloudwatch/home?region=${region}#logsV2:log-groups/log-group/${(extractLogGroupPath(context))}/log-events/${extractLogStreamPath(context)}`;
}

function extractRegion(context: Context) {
    const trimmedArn = context.invokedFunctionArn.replace("arn:aws:lambda:", "");
    const regionEnd = trimmedArn.indexOf(":");
    return trimmedArn.substring(0, regionEnd)
}

function extractLogStreamPath(context: Context) {
    return encodeURIComponent(encodeURIComponent(context.logStreamName)).replaceAll("%", "$");
}

function extractLogGroupPath(context: Context) {
    return encodeURIComponent(encodeURIComponent(context.logGroupName)).replaceAll("%", "$");
}