# pulumi-aks-workshop
This workshop focuses on the process of provisioning and configuring an AKS cluster on Azure using Pulumi

## Deploying the App

To deploy your infrastructure, follow the below steps.

### Prerequisites

[Get started with Pulumi & Azure](https://www.pulumi.com/docs/iac/get-started/azure/begin/)

### Steps

After cloning this repo, from this working directory, run these commands:

1. Install the required Node.js packages:

    ```bash
    $ npm install
    ```

2. Create a new stack, which is an isolated deployment target for this example:

    ```bash
    $ pulumi stack init
    ```

3. Configure the stack.

    The pulumi config CLI command can save some values as configuration parameters. Run the following commands to set the names for some of values that may its reusable in multiple environments:
    ```bash
    $pulumi config set k8sVersion 1.30.3
    $pulumi config set nodeCount 3
    $pulumi config set nodeSize Standard_A2_v2
    $pulumi config set adminUser ingress-nginx
    $pulumi config set ingressNamespace 1.30.3
    $pulumi config set appNamespace apps
    $pulumi config set letenscriptEmail <your_email>
    ```

4. Update the stack.

    ```bash
    $ pulumi up
    ```
   
5. Once you've finished experimenting, tear down your stack's resources by destroying and removing it:

    ```bash
    $ pulumi destroy --yes
    $ pulumi stack rm --yes
    ```