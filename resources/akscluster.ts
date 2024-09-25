import * as azure_native from "@pulumi/azure-native";
import * as pulumi from "@pulumi/pulumi";
import * as tls from "@pulumi/tls";
import * as containerservice from "@pulumi/azure-native/containerservice";
import { config } from "../config";

export const aksCluster = (
    resourceGroupName: pulumi.Input<string>, 
    subnetIds: {
        nodeSubnetId: pulumi.Output<string>,
        podSubnetId: pulumi.Output<string>
    }) => {
    // Create a Log Analytics Workspace
    // const logAnalyticsWorkspace = new azure_native.operationalinsights.Workspace("aksLogAnalyticsWorkspace", {
    //     resourceGroupName: resourceGroupName,
    //     location: config.location,
    //     sku: {
    //         name: "PerGB2018",
    //     },
    //     retentionInDays: 30,  // Adjust log retention as needed
    // });

    // create a private key to use for the cluster's ssh key
    const privateKey = new tls.PrivateKey("privateKey", {
        algorithm: "RSA",
        rsaBits: 4096,
    });

    // create a user assigned identity to use for the cluster
    const identity = new azure_native.managedidentity.UserAssignedIdentity("identity", { resourceGroupName: resourceGroupName });

    return new containerservice.ManagedCluster("cluster", {
        resourceGroupName: resourceGroupName,
        // Use a user-specified identity to manage cluster resources
        identity: {
            type: azure_native.containerservice.ResourceIdentityType.UserAssigned,
            userAssignedIdentities: [identity.id],
        },
        agentPoolProfiles: [{
            count: config.nodeCount, // Number of nodes in the pool
            maxPods: 110, 
            mode: "System",
            name: "agentpool",
            nodeLabels: {},
            osDiskSizeGB: 30,
            osType: "Linux",
            type: "VirtualMachineScaleSets",
            vmSize: config.nodeSize, // VM size for the nodes
            vnetSubnetID: subnetIds.nodeSubnetId, // Assign nodes to the subnet
            podSubnetID: subnetIds.podSubnetId // Assign pods to the subnet
        }],
        dnsPrefix: resourceGroupName,
        enableRBAC: true, // Enable Role-Based Access Control
        kubernetesVersion: config.k8sVersion,
        linuxProfile: {
            adminUsername: config.adminUserName, // The admin username for the new cluster.
            ssh: {
                publicKeys: [{
                    keyData: privateKey.publicKeyOpenssh,
                }]
            },
        },
        networkProfile: {
            networkPlugin: "azure" // Use Azure CNI for networking
        }
        // // Enable Monitoring with Log Analytics
        // addonProfiles: {
        //     omsAgent: { // Configures the monitoring agent to collect logs and metrics
        //         enabled: true,
        //         config: {
        //             logAnalyticsWorkspaceResourceID: logAnalyticsWorkspace.id,
        //         },
        //     },
        // }
    });
};