import * as k8s from "@pulumi/kubernetes";
import { config } from "../config";

export const kuardAppDeployment = (k8sProvider) => {
    const name = "kuard";
    // Mapping IP Address to a hostname
    const host = 'kuard.104.43.76.238.nip.io';
    // Step 1: Create a KUARD Deployment
    const kuardDeployment = new k8s.apps.v1.Deployment("kuard-deployment", {
        metadata: {
            namespace: config.appNamespace,
            name: name,
            labels: { app: name},
        },
        spec: {
            replicas: 1,
            selector: { matchLabels: { app: name } },
            template: {
                metadata: { labels: { app: name } },
                spec: {
                    containers: [
                        {
                            name: name,
                            image: "gcr.io/kuar-demo/kuard-amd64:blue", // KUARD container image
                            resources: {requests: {cpu: "50m", memory: "20Mi"}},
                            ports: [{ containerPort: 8080 }],
                        },
                    ],
                },
            },
        },
    }, { provider: k8sProvider });

    // Step 2: Create a KUARD Service
    const kuardService = new k8s.core.v1.Service("kuard-service", {
        metadata: {
            namespace: config.appNamespace,
            name: name,
            labels: { app: name },
        },
        spec: {
            type: "ClusterIP",  // Internal Service
            ports: [{ port: 80, targetPort: 8080 }],
            selector: { app: name },
        },
    }, { provider: k8sProvider, dependsOn: kuardDeployment });

    // Step 3: Create an Ingress Resource for KUARD
  const kuardIngress = new k8s.networking.v1.Ingress("kuard-ingress", {
    metadata: {
        namespace: config.appNamespace,
        name: "kuard-ingress",
        annotations: {
            "kubernetes.io/ingress.class": "nginx",
            "cert-manager.io/issuer": "letsencrypt-staging"
        }
    },
    spec: {
        tls: [{
            hosts: [host],
            secretName: "letsencrypt-staging-tls",
        }],
        rules: [{
            host: host,
            http: {
                paths: [{
                    path: "/",
                    pathType: "Prefix",
                    backend: {
                        service: {
                            name: "kuard",
                            port: { number: 80 },
                        },
                    },
                }],
            },
        }],
    },
  }, { provider: k8sProvider, dependsOn: kuardService });
};

