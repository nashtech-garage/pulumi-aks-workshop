import * as azure_native from "@pulumi/azure-native";
import * as k8s from "@pulumi/kubernetes";
import * as pulumi from "@pulumi/pulumi";
import * as resources from "@pulumi/azure-native/resources";

import { virtualNetWork } from "./resources/virtualnetwork";
import { containerRegistry } from "./resources/containerregistry";
import { aksCluster } from "./resources/akscluster";
import { nginxIngressController } from "./resources/nginxingresscontroller";
import { aksClusterIssuer } from "./resources/certmanager";
import { createNamespaces } from "./resources/namespaces";
import { kuardAppDeployment } from "./app/applicationdeployment";

import { config } from "./config";

// Create an Azure Resource Group
const resourceGroup = new resources.ResourceGroup("resourceGroup", {
    resourceGroupName: "pulumi-aks-rg",
    location: config.location
});

// Create a new virtual network
export const vnet = virtualNetWork(resourceGroup.name);

// Create azure container registry (acr)
export const acr = containerRegistry(resourceGroup.name);

// Create a AKS cluster
const cluster = aksCluster(resourceGroup.name, vnet);

// Pull artifacts from a container registry.
const acrPull_RoleDefinitionId = "/providers/Microsoft.Authorization/roleDefinitions/7f951dda-4ed3-4680-a7ca-43fe172d538d";
// Grant AKS cluster identity the right to pull images from ACR
const acrPullRoleAssignment = new azure_native.authorization.RoleAssignment("aksAcrPullRoleAssignment", {
    principalId: cluster.identityProfile.apply(profile => profile?.kubeletidentity.objectId!),
    principalType: "ServicePrincipal",
    roleDefinitionId: acrPull_RoleDefinitionId,
    scope: acr.id,
}, { dependsOn: cluster });

// Export the AKS Cluster kubeconfig
export const kubeconfig = pulumi.all([cluster.name, resourceGroup.name]).apply(([clusterName, rgName]) =>
    azure_native.containerservice.listManagedClusterUserCredentials({
        resourceGroupName: rgName,
        resourceName: clusterName,
    }).then(creds => Buffer.from(creds.kubeconfigs[0].value, "base64").toString())
);

const provider = new k8s.Provider("k8s-provider", {
    kubeconfig: kubeconfig,
});

// Create Kubernetes namespaces
const namespaces = createNamespaces(provider);

// Install the NGINX Ingress Controller and expose it as a LoadBalancer service so that it has an external IP address.
const ingressController = nginxIngressController(provider);

// Set Up Cert-Manager for Automatic Let's Encrypt Certificates
const letsEncryptIssuer = aksClusterIssuer(provider);

// Create a KUARD (Kubernetes Up and Running Demo) deployment and expose it through an ingress resource 
const kuardApp = kuardAppDeployment(provider);

export const resourceGroupName = resourceGroup.name;

