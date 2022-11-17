# cfn-response-ts
AWS Custom Resource handler that is alternative for cfn-response

## Contract

### send
Method for sending status to the AWS when invoked by Cloudformation based on the simplified response status 
```(typescript)
export interface CustomResourceResult {
    PhysicalResourceId?: string,
    Data?: {
        [Key: string]: any;
    } | undefined,
    NoEcho?: boolean | undefined,
    Status: "SUCCESS" | "FAILED",
    Reason?: string
}
```

### createLambdaHandler
Creates handler for custom resource based on the methods for all request types that are triggered by AWS Cloudformation like:
- onCreate
- onUpdate
- onDelete

Example handler
```(typescript)
import {
    CloudFormationCustomResourceCreateEvent,
    CloudFormationCustomResourceDeleteEvent,
    CloudFormationCustomResourceEvent,
    CloudFormationCustomResourceResponse,
    CloudFormationCustomResourceUpdateEvent,
    Context
} from 'aws-lambda';
import {IdentitystoreClient} from "@aws-sdk/client-identitystore"
import {buildCreateUserCommand, buildDeleteUserCommand, buildUpdateUserCommand} from "./identityCenter/commands";
import {createLambdaHandler, CustomResourceResult} from "cfn-response-ts";

const identityStoreClient = new IdentitystoreClient({})
const handler = createLambdaHandler(onCreate, onUpdate, onDelete)

export const lambdaHandler = async (event: CloudFormationCustomResourceEvent, context: Context): Promise<CloudFormationCustomResourceResponse> => {
    console.info("Got event", JSON.stringify(event), 'Got context', context)

    return handler(event, context)
}

async function onCreate(event: CloudFormationCustomResourceCreateEvent, context: Context): Promise<CustomResourceResult> {
    const command = buildCreateUserCommand(event)
    const result = await identityStoreClient.send(command);
    return {
        PhysicalResourceId: result.UserId,
        Data: {
            UserId: result.UserId,
        },
        Status: "SUCCESS",
    }
}

async function onUpdate(event: CloudFormationCustomResourceUpdateEvent, context: Context): Promise<CustomResourceResult> {
    const command = buildUpdateUserCommand(event)
    await identityStoreClient.send(command)

    return {
        PhysicalResourceId: event.PhysicalResourceId,
        Data: {
            UserId: event.PhysicalResourceId,
        },
        Status: "SUCCESS",
    }
}

async function onDelete(event: CloudFormationCustomResourceDeleteEvent, context: Context): Promise<CustomResourceResult> {
    const command = buildDeleteUserCommand(event)
    await identityStoreClient.send(command)

    return {
        PhysicalResourceId: event.PhysicalResourceId,
        Data: {
            UserId: event.PhysicalResourceId,
        },
        Status: "SUCCESS",
    }
}

```