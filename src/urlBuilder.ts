import {Context} from "aws-lambda";

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
