import {CloudFormationCustomResourceEvent, CloudFormationCustomResourceResponse, Context} from "aws-lambda";
import fetch from "node-fetch"
import {buildLogStreamUrl} from "./urlBuilder.js";

const createFailedMessage = "customResource::creation-failed"

export const SUCCESS: CloudformationStatus = {
    status: "SUCCESS"
};
export type CloudformationStatus = {
    status: "SUCCESS" | "FAILED",
    reason?: string
}

/**
 *
 * @param event - Cloudformation event
 * @param context - lambda context
 * @param responseStatus - SUCCESS or FAILED
 * @param responseData - data you want expose
 * @param physicalResourceId - when returned value will be different it will replace items
 * @param noEcho
 */
export async function send(event: CloudFormationCustomResourceEvent,
                           context: Context,
                           responseStatus: CloudformationStatus,
                           responseData: any = {},
                           physicalResourceId: string | undefined = undefined,
                           noEcho: boolean = false): Promise<CloudFormationCustomResourceResponse> {

    try {
        const body = {
            Status: getStatus(event, responseStatus.status),
            Reason: `${responseStatus.reason || ''}\nFull logs: ${buildLogStreamUrl(context)}`,
            PhysicalResourceId: physicalResourceId || buildPhysicalResourceId(event, context),
            StackId: event.StackId,
            RequestId: event.RequestId,
            LogicalResourceId: event.LogicalResourceId,
            NoEcho: noEcho,
            Data: responseData
        };
        return await sendHttpRequest(event, body);
    } catch (e) {
        console.error("Sending Cloudformation confirmation failed", e)
        return Promise.reject(e);
    }

}

function buildPhysicalResourceId(event: CloudFormationCustomResourceEvent, context: Context) {
    return event.RequestType !== "Create" ? event.PhysicalResourceId : `${createFailedMessage}:${event.LogicalResourceId}`
}

async function sendHttpRequest(event: CloudFormationCustomResourceEvent, body: CloudFormationCustomResourceResponse) {
    await fetch(event.ResponseURL, {
        method: "put",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    })

    return Promise.resolve(body)
}

function getStatus(event: CloudFormationCustomResourceEvent, status: "SUCCESS" | "FAILED"): "SUCCESS" | "FAILED" {
    if (event.RequestType === "Delete" && status === "FAILED" && event.PhysicalResourceId?.startsWith(createFailedMessage)) {
        return "SUCCESS"
    }

    return status
}
