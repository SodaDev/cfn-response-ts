import {
    CloudFormationCustomResourceCreateEvent,
    CloudFormationCustomResourceDeleteEvent,
    CloudFormationCustomResourceEvent,
    CloudFormationCustomResourceResponse,
    CloudFormationCustomResourceUpdateEvent,
    Context
} from "aws-lambda";
import {send} from "./client.js";
import {CustomResourceResult} from "./model.js";

type lambdaHandlerFunction = (event: CloudFormationCustomResourceEvent, context: Context) => Promise<CloudFormationCustomResourceResponse>

export function createLambdaHandler(
    onCreate: (event: CloudFormationCustomResourceCreateEvent, context: Context) => Promise<CustomResourceResult>,
    onUpdate: (event: CloudFormationCustomResourceUpdateEvent, context: Context) => Promise<CustomResourceResult>,
    onDelete: (event: CloudFormationCustomResourceDeleteEvent, context: Context) => Promise<CustomResourceResult>
): lambdaHandlerFunction {
    return async (event: CloudFormationCustomResourceEvent, context: Context): Promise<CloudFormationCustomResourceResponse> => {
        try {
            switch (event.RequestType) {
                case "Create":
                    return await send(event, context, await onCreate(event, context))
                case "Update":
                    return await send(event, context, await onUpdate(event, context))
                case "Delete":
                    return await send(event, context, await onDelete(event, context))
                default:
                    return await send(event, context, {
                        Status: "FAILED",
                        Reason: `Malformed request type on ${event}`
                    })
            }
        } catch (err: any) {
            console.log(err);
            return send(event, context, {
                Status: "FAILED",
                Reason: err.toString()
            })
        }
    }
}
