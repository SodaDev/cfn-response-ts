import {
    CloudFormationCustomResourceCreateEvent,
    CloudFormationCustomResourceDeleteEvent,
    CloudFormationCustomResourceEvent,
    CloudFormationCustomResourceResponse,
    CloudFormationCustomResourceUpdateEvent,
    Context
} from "aws-lambda";
import {send} from "./client.js";

export async function createLambdaHandler(
    onCreate: (event: CloudFormationCustomResourceCreateEvent, context: Context) => Promise<CloudFormationCustomResourceResponse>,
    onUpdate: (event: CloudFormationCustomResourceUpdateEvent, context: Context) => Promise<CloudFormationCustomResourceResponse>,
    onDelete: (event: CloudFormationCustomResourceDeleteEvent, context: Context) => Promise<CloudFormationCustomResourceResponse>
) {
    return async (event: CloudFormationCustomResourceEvent, context: Context): Promise<CloudFormationCustomResourceResponse> => {
        try {
            switch (event.RequestType) {
                case "Create":
                    return await onCreate(event, context)
                case "Update":
                    return await onUpdate(event, context)
                case "Delete":
                    return await onDelete(event, context)
                default:
                    return await send(event, context, {status: "FAILED"})
            }
        } catch (err: any) {
            console.log(err);
            return send(event, context, {
                status: "FAILED",
                reason: err.toString()
            })
        }
    }
}
