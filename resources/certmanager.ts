import * as k8s from "@pulumi/kubernetes";
import * as pulumi from "@pulumi/pulumi";
import { config } from "../config";

export const aksClusterIssuer = (k8sProvider) => {
    // Create a namespace for Cert-manager
    const certManagerNamespace = new k8s.core.v1.Namespace("cert-manager", {
        metadata: {
            name: "cert-manager",
        },
    }, { provider: k8sProvider });

    // Install Cert-manager using Helm
    const cert = new k8s.helm.v4.Chart("cert-manager", {
        chart: "cert-manager",
        version: "1.15.3",
        repositoryOpts: {
            repo: "https://charts.jetstack.io",
        },
        namespace: certManagerNamespace.metadata.name,
        values: {
            installCRDs: true
        },
    }, { transformations: [
        // Ignore changes that will be overwritten by the deployment.
        // https://www.pulumi.com/registry/packages/kubernetes/how-to-guides/managing-resources-with-server-side-apply/#handle-field-conflicts-on-existing-resources
        args => {
            if (args.type === "kubernetes:admissionregistration.k8s.io/v1:ValidatingWebhookConfiguration" ||
                args.type === "kubernetes:admissionregistration.k8s.io/v1:MutatingWebhookConfiguration") {
                return {
                    props: args.props,
                    opts: pulumi.mergeOptions(args.opts, {
                        ignoreChanges: ["metadata.annotations.template", "webhooks[*].clientConfig"],
                    })
                }
            }
            return undefined;
        }
    ], provider: k8sProvider });

    // Create a ClusterIssuer for Let's Encrypt
    const letsEncryptIssuer = new k8s.apiextensions.CustomResource("letsencrypt-issuer", {
        apiVersion: "cert-manager.io/v1",
        kind: "Issuer",
        metadata: {
            name: "letsencrypt-staging",
            namespace: config.appNamespace
        },
        spec: {
            acme: {
                server: "https://acme-staging-v02.api.letsencrypt.org/directory",
                email: config.letenscriptEmail, // Replace with your email
                privateKeySecretRef: {
                    name: "letsencrypt-staging",
                },
                solvers: [{
                    http01: {
                        ingress: {
                            ingressClassName: "nginx",
                        },
                    },
                }],
            },
        },
    }, { provider: k8sProvider, dependsOn: cert });

    return letsEncryptIssuer;
}