import {CloudFormationCustomResourceEvent, CloudFormationCustomResourceResponse, Context} from "aws-lambda";
import fetch from "node-fetch"
import {buildCfnResponse} from "./requestBuilder.js";
import {CustomResourceResult} from "./model.js";

export async function send(event: CloudFormationCustomResourceEvent,
                           context: Context,
                           cfResult: CustomResourceResult): Promise<CloudFormationCustomResourceResponse> {
    try {
        return await sendHttpRequest(event, buildCfnResponse(event, context, cfResult));
    } catch (e) {
        console.error("Sending Cloudformation confirmation failed", e)
        return Promise.reject(e);
    }
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

