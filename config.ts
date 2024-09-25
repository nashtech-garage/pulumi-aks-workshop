import * as pulumi from "@pulumi/pulumi";

// Create a configuration object
const pulumiConfig = new pulumi.Config();

// Access a configuration value and export for reusing
export const config = {
    location: pulumiConfig.get("azure-native:location"),
    k8sVersion: pulumiConfig.get("k8sVersion") || "1.30.3",
    nodeCount: pulumiConfig.getNumber("nodeCount") || 3,
    nodeSize: pulumiConfig.get("nodeSize") || "Standard_A2_v2",
    adminUserName: pulumiConfig.get("adminUser") || "aksadmin",
    ingressNamespace: pulumiConfig.get("ingressNamespace") || "ingress-nginx",
    appNamespace: pulumiConfig.get("appNamespace") || "apps",
    letenscriptEmail: pulumiConfig.get("letenscriptEmail") || "your_email",
}