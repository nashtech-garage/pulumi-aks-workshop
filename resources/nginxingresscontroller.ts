import * as k8s from "@pulumi/kubernetes";
import { config } from "../config";

export const nginxIngressController = (k8sProvider) => {
//   // Deploy the NGINX Ingress Controller
  const nginxIngressController = new k8s.helm.v4.Chart("nginx-ingress-controller", {
    chart: "nginx-ingress-controller",
    namespace: config.ingressNamespace,
    version: "11.4.1", // Pin the Helm chart version for production stability
    repositoryOpts: {
        repo: "https://charts.bitnami.com/bitnami"
    },
    values: {
        controller: {
            service: {
                type: "LoadBalancer",
            }
        },
        resources: {
            limits: {
                cpu: "500m",
                memory: "512Mi", // Set resource limits for production optimization
            },
            requests: {
                cpu: "250m",
                memory: "256Mi",
            },
        }
    }
  }, { provider: k8sProvider });

  return nginxIngressController.resources;

}
