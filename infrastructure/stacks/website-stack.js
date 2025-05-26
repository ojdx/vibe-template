const cdk = require('aws-cdk-lib');
const s3 = require('aws-cdk-lib/aws-s3');
const cloudfront = require('aws-cdk-lib/aws-cloudfront');
const origins = require('aws-cdk-lib/aws-cloudfront-origins');
const acm = require('aws-cdk-lib/aws-certificatemanager');
const route53 = require('aws-cdk-lib/aws-route53');
const targets = require('aws-cdk-lib/aws-route53-targets');
const s3deploy = require('aws-cdk-lib/aws-s3-deployment');
const projectConfig = require('../../project.config');

class WebsiteStack extends cdk.Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    // Import existing certificate
    const certificate = acm.Certificate.fromCertificateArn(
      this,
      'Certificate',
      props.certificateArn
    );

    // Create bucket name based on production vs feature branch
    const bucketName = projectConfig.helpers.getBucketName(props.branchName, this.account);

    // Create S3 bucket for static website hosting
    this.bucket = new s3.Bucket(this, 'WebsiteBucket', {
      bucketName,
      websiteIndexDocument: projectConfig.deployment.indexDocument,
      websiteErrorDocument: projectConfig.deployment.errorDocument,
      publicReadAccess: false, // CloudFront will access via OAC
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // Create Origin Access Control for secure S3 access
    const s3BucketOrigin = origins.S3BucketOrigin.withOriginAccessControl(this.bucket);
    // Create S3 bucket for CloudFront access logs
    const logsBucketName = `${bucketName}-logs`;
    this.logsBucket = new s3.Bucket(this, 'LogsBucket', {
      bucketName: logsBucketName,
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      objectOwnership: s3.ObjectOwnership.BUCKET_OWNER_PREFERRED, // Required for CloudFront logs
      autoDeleteObjects: true,
      lifecycleRules: [
        {
          id: 'DeleteOldLogs',
          enabled: true,
          expiration: cdk.Duration.days(projectConfig.aws.s3.logRetentionDays), // Configurable log retention
        },
      ],
    });

    // Create CloudFront distribution
    this.distribution = new cloudfront.Distribution(this, 'Distribution', {
      defaultBehavior: {
        origin: s3BucketOrigin,
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
        cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        compress: true,
      },
      domainNames: props.isProduction && projectConfig.domain.includeWww ? [props.domainName, `www.${props.domainName}`] : [props.domainName],
      certificate,
      minimumProtocolVersion: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,
      httpVersion: cloudfront.HttpVersion.HTTP2_AND_3,
      priceClass: cloudfront.PriceClass[projectConfig.aws.cloudfront.priceClass], // Configurable price class
      defaultRootObject: projectConfig.deployment.indexDocument,
      enableLogging: true,
      logBucket: this.logsBucket,
      logFilePrefix: 'cloudfront-logs/',
      logIncludesCookies: false,
      errorResponses: [
        {
          httpStatus: 404,
          responseHttpStatus: 404,
          responsePagePath: `/${projectConfig.deployment.errorDocument}`,
          ttl: cdk.Duration.minutes(projectConfig.aws.cloudfront.cacheTTL.error404),
        },
        {
          httpStatus: 403,
          responseHttpStatus: 404,
          responsePagePath: `/${projectConfig.deployment.errorDocument}`,
          ttl: cdk.Duration.minutes(projectConfig.aws.cloudfront.cacheTTL.error403),
        },
      ],
    });

    // Deploy website content
    new s3deploy.BucketDeployment(this, 'DeployWebsite', {
      sources: [s3deploy.Source.asset(projectConfig.deployment.publicDir)],
      destinationBucket: this.bucket,
      distribution: this.distribution,
      distributionPaths: ['/*'],
    });

    // Look up existing hosted zone (always use root domain)
    const rootDomain = props.isProduction ? props.domainName : projectConfig.domain.root;
    const hostedZone = route53.HostedZone.fromLookup(this, 'HostedZone', {
      domainName: rootDomain,
    });

    // Create DNS records
    new route53.ARecord(this, 'AliasRecord', {
      zone: hostedZone,
      recordName: props.isProduction ? undefined : props.domainName.split('.')[0], // subdomain for feature branches
      target: route53.RecordTarget.fromAlias(
        new targets.CloudFrontTarget(this.distribution)
      ),
    });

    // Only create www record for production if configured
    if (props.isProduction && projectConfig.domain.includeWww) {
      new route53.ARecord(this, 'WwwAliasRecord', {
        zone: hostedZone,
        recordName: 'www',
        target: route53.RecordTarget.fromAlias(
          new targets.CloudFrontTarget(this.distribution)
        ),
      });
    }

    // Outputs
    new cdk.CfnOutput(this, 'BucketName', {
      value: this.bucket.bucketName,
      description: 'S3 bucket name for website content',
    });

    new cdk.CfnOutput(this, 'DistributionId', {
      value: this.distribution.distributionId,
      description: 'CloudFront distribution ID',
    });

    new cdk.CfnOutput(this, 'DistributionDomainName', {
      value: this.distribution.distributionDomainName,
      description: 'CloudFront distribution domain name',
    });

    new cdk.CfnOutput(this, 'WebsiteURL', {
      value: `https://${props.domainName}`,
      description: 'Website URL',
    });

    new cdk.CfnOutput(this, 'LogsBucketName', {
      value: this.logsBucket.bucketName,
      description: 'S3 bucket name for CloudFront access logs',
    });
  }
}

module.exports = { WebsiteStack };