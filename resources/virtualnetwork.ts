import * as pulumi from "@pulumi/pulumi";
import * as azure_native from "@pulumi/azure-native";
import { config } from "../config";

export const virtualNetWork = (resourceGroupName:  pulumi.Input<string>) => {
    // Create a Virtual Network for the cluster.
    const vnet = new azure_native.network.VirtualNetwork("aksVNet", {
        addressSpace: {
            addressPrefixes: ["10.0.0.0/8"],
        },
        flowTimeoutInMinutes: 10,
        location: config.location,
        resourceGroupName: resourceGroupName
    });

    // Create a Node Subnet for the cluster.
    const nodeSubnet = new azure_native.network.Subnet("aksNodeSubnet", {
        addressPrefix: "10.240.0.0/16",
        resourceGroupName: resourceGroupName,
        subnetName: "aksNodeSubnet",
        virtualNetworkName: vnet.name,
    });

    // Create a Pod Subnet for the cluster.
    const podSubnet = new azure_native.network.Subnet("aksPodSubnet", {
        addressPrefix: "10.241.0.0/16",
        resourceGroupName: resourceGroupName,
        // Subnet Delegation to Azure Kubernetes Service
        delegations: [{
            name: "aksDelegation",
            serviceName: "Microsoft.ContainerService/managedClusters", // AKS delegation
        }],
        subnetName: "aksPodSubnet",
        virtualNetworkName: vnet.name,
    });

    return {
        nodeSubnetId: nodeSubnet.id,
        podSubnetId: podSubnet.id,
    };
}