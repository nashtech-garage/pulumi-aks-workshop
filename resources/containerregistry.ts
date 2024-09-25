import * as azure from "@pulumi/azure-native/";
import * as pulumi from "@pulumi/pulumi";
import { config } from "../config";

export const containerRegistry = (resourceGroupName: pulumi.Input<string>) => {
    // Create the Azure Container Registry (ACR)
    const containerRegistry = new azure.containerregistry.Registry("aksregistry", {
        resourceGroupName: resourceGroupName, // Reference the resource group
        sku: {
            name: "Standard", // ACR pricing tier: Basic, Standard, or Premium
        },
        adminUserEnabled: true, // Optional: Enable the admin user (useful for simple scenarios)
        location: config.location // Set location same as the resource group
    });
    
    // Return ACR resource
    return containerRegistry;
}