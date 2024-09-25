import * as k8s from "@pulumi/kubernetes";
import { config } from "../config";

export const createNamespaces = (k8sProvider) => {
    // Create an app Kubernetes Namespace within the AKS cluster
    const appNamespace = new k8s.core.v1.Namespace(config.appNamespace, {
        metadata: {
            name: config.appNamespace,
        },
    }, { provider: k8sProvider, dependsOn: k8sProvider });

    // Create a namespace for the ingress
    new k8s.core.v1.Namespace(config.ingressNamespace, {
        metadata: {
            name: config.ingressNamespace,
        },
        }, { provider: k8sProvider, dependsOn: k8sProvider }
    );
}
