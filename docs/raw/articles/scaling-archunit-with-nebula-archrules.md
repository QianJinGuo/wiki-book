---
source: rss
source_url: https://netflixtechblog.com/scaling-archunit-with-nebula-archrules-b4642c464c5a?source=rss----2615bd06b42e---4
ingested: 2026-06-07
feed_name: Netflix Tech Blog
source_published: 2026-05-08
sha256: 5dcdc7520d0665cdef33d3f8ee8c7aafdc1bb3f9f17421a8549d3a21afd1f74b
---

# Scaling ArchUnit with Nebula ArchRules

By [John Burns](<https://github.com/wakingrufus>) and [Emily Yuan](<https://www.linkedin.com/in/emilyyuan03/>)

### Introduction

At Netflix, we operate using a [polyrepo](<https://netflixtechblog.com/towards-true-continuous-integration-distributed-repositories-and-dependencies-2a2e3108c051>) strategy with tens of thousands of Java repositories. This means that we need to have ways of sharing common build logic across these repositories. On the [JVM Ecosystem team](<https://sites.google.com/netflix.com/javaplatformnetflix/jvm>) within Java Platform, we build tooling such as the [Nebula suite of Gradle plugins](<https://github.com/nebula-plugins>) to provide standard ways to build projects, keep dependencies up-to-date, and publish artifacts reliably across the Java ecosystem. Our mission also entails providing build-time feedback to the developer when they deviate from the [paved road](<https://netflixtechblog.com/how-we-build-code-at-netflix-c5d9bd727f15>), or when their code base contains technical debt.

### Case Study

After a Netflix incident relating to a library releasing a backwards-incompatible change, our team was asked to provide some tooling and practices to improve the Java library lifecycle management. This was not a simple case of a library making a reckless breaking change. The code removed had been deprecated for years. Library authors often struggle to know when it is safe to remove deprecated code, or refactor code that is not meant to be used by downstream applications. Fleet-wide migrations, such as upgrading major Spring Boot versions, also involve deprecated code removal. To help with this, we established a suite of API lifecycle annotations:

  * @Deprecated from the Java standard library
  * @Public A custom annotation to use on APIs meant to be used downstream
  * @Experimental A custom annotation for new APIs which may not yet be stable
  * All other APIs are assumed to be “internal”



Library authors can annotate their APIs with these annotations. However, how will they know which downstream projects are using their API incorrectly, based on these?

As we sought to improve the paved road for JVM-based libraries at Netflix, we needed a good way of identifying this kind of technical debt, not only for the benefit of the Java Platform-provided libraries, but any team delivering shared libraries to the organization. For this, we looked at ArchUnit.

[ArchUnit](<https://www.archunit.org/>) is a popular OSS library (3.5k stars, 84 contributors) used to enforce “architectural” code rules as part of a JUnit suite. It is used internally by Gradle, Spring, and is provided as part of the [Spring Modulith](<https://spring.io/projects/spring-modulith>) platform. The rules engine, which is built directly on top of [ASM](<https://asm.ow2.io/>), can be used for a wide variety of use cases. It is powerful enough to be a general purpose static analysis tool with the following distinctive features:

1\. Works cross-language (JVM), because it uses ASM/bytecode, not AST parsing.

2\. Exposes a builder API pattern that makes it easy to write rules

3\. Also has a lower level API ideal for writing more complex custom rules.

The limitation of ArchUnit is that it is designed to be used as part of a JUnit suite in a single repository. The Nebula ArchRules plugins give organizations the ability to share and apply rules across any number of repositories. Rules can be sourced from OSS libraries or private internal libraries. This makes the plugin generally useful for any JVM+Gradle engineering organization.

### Why ArchUnit?

Before we go into how ArchRules works, it is good to understand why we would want to use ArchUnit in this way instead of other static analysis tools.

#### AST vs Bytecode

Some tools, such as PMD, process rules against an AST (abstract syntax tree). An AST is a structured representation of source code. This kind of tool will have rules that are syntax dependent. Rules that need to support multiple JVM languages, such as Kotlin or Scala, often need to be rewritten for each language. It also allows code which should be found to be hidden under syntactic sugar not anticipated by the rule author. ArchUnit uses [ASM](<https://asm.ow2.io/>) to analyze actual compiled bytecode, which means it doesn’t matter how that code was produced. What is analyzed is the actual code that will be run.

#### Rule Authorship

Tools like PMD and Spotbugs are not optimized for custom rule authorships. Most usage of these tools run built-in provided rules, or add in pre-made third party plugins. Take a look at what a custom rule for PMD might look like:
    
    
    <![CDATA[  
     //AllocationExpression/ClassOrInterfaceType[  
       @Image='DateTime' and (  
           (count(..//Name[@Image='DateTimeZone.UTC'])<=0)  
           and  
           (count(..//Name[@Image='DateTimeZone.forID'])<=0)  
        ) or (  
           (  
               (count(..//Name[@Image='DateTimeZone.UTC'])>0)  
                 or  
               (count(..//Name[@Image='DateTimeZone.forID'])>0)  
           ) and (../Arguments/ArgumentList and count(../Arguments/ArgumentList/Expression) = 1)  
       )  
     ]  
    ]]>

This rule ensures that DateTimes are not instantiated without an explicit zone. This is a raw string meant to be used within PMD’s xpath parser. There is no IDE guidance on crafting it. To test it, a whole separate PMD process needs to be wired up to interpret the rule and evaluate it against a source file. Let’s see how a similar rule would look with ArchUnit:
    
    
    ArchRuleDefinition.priority(Priority.MEDIUM)  
    .noClasses()  
    .should()  
    .callConstructorWhere(  
        // constructor does not have a zone arguement  
        target(doesNot(have(rawParameterTypes(DateTimeZone.class))))  
       // constructor is for DateTime  
            .and(targetOwner(assignableTo(DateTime.class)))  
    )

This is type-safe Java code with a fluent API. It is also simple to unit test, as ArchUnit has a method to pass a rule object and class references to evaluate the rule against those classes.

#### Class Relations

Because ArchUnit processes the entire classpath with ASM, it retains a graph of the class data, allowing rules to easily traverse class relationships and call sites. This allows rules to have much more context about the code it is evaluating.

### Rules Libraries

The first step was to build the ability to write ArchUnit rules which can be shared and published. In order to do this, we have the [ArchRules Library Plugin](<https://github.com/nebula-plugins/nebula-archrules-plugin?tab=readme-ov-file#authoring-rules>). This plugin adds an additional source set to your Gradle project called archRules. In this source set, you can create a class which implements the ArchRulesService interface. This interface has a single abstract method which returns a Map<String, ArchRule>. The keys of this map are the names of your rules, and the ArchRule is the rule you would like to define using the standard ArchUnit API. Here is an example:
    
    
    public class GuavaRules implements ArchRulesService {  
      static final ArchRule OPTIONAL = ArchRuleDefinition.priority(Priority.MEDIUM)  
            .noClasses()  
            .should()  
            .dependOnClassesThat()  
            .haveFullyQualifiedName("com.google.common.base.Optional")  
            .because("Java Optional is preferred over Guava Optional");  
      
        @Override  
        public Map<String, ArchRule> getRules() {  
            Map<String, ArchRule> rules = new HashMap<>();  
            rules.put("guava optional", OPTIONAL);  
            return rules;  
        }  
    }

This code and its dependencies will not be bundled with your main code. It is bundled into a separate Jar with the arch-rules classifier. When publishing, your library will publish this jar as a separate variant with the usage attribute set to arch-rules. This means that in order for downstream projects to use these rules, they must use [Gradle Module Metadata](<https://docs.gradle.org/current/userguide/publishing_gradle_module_metadata.html>) for dependency resolution. There are 2 flavors of rules Libraries: Standalone rules libraries, bundled rule libraries.

#### Standalone Rule Libraries

A Standalone Rule library contains no main code: only archRules. These are useful for defining rules for code you don’t own, such as Core Java APIs or OSS libraries. They are also useful for generic rules that can apply to any code, such as “don’t use code marked as @Deprecated”. We maintain a [collection](<https://github.com/nebula-plugins/nebula-archrules>) of OSS Standalone rule libraries which anyone is free to use, and serve as examples of the types of rules you may want to write yourself. However, the real power of ArchRules is in “bundled rule libraries”.

#### Bundled Rule Libraries

A bundled rule library is a library with both main and archRules sources. The main source set will contain useful library code, whatever it may be. The archRules will contain rules specific to the usage of that library. For example, rules scoped to that library’s package, or referencing that library’s specific API. Whenever possible, we recommend writing rules in this bundled way. That is because the [ArchRules Runner Plugin](<https://github.com/nebula-plugins/nebula-archrules-plugin?tab=readme-ov-file#running-rules>) will be able to automatically detect these rules and run them in only the source sets that use this library as a dependency. An example of this can be seen in our [Nebula Test](<https://github.com/nebula-plugins/nebula-test/blob/main/src/archRules/java/com/netflix/nebula/test/archrules/NebulaTestArchRules.java>) library.

In any case, the library plugin will automatically generate a service loader registration entry for your ArchRulesService so that the runner can discover your rules.

### Running Rules

The [ArchRules Runner Plugin](<https://github.com/nebula-plugins/nebula-archrules-plugin?tab=readme-ov-file#running-rules>) allows rules to be evaluated against your code. Standalone rule libraries can be evaluated against all source sets by adding them to the archRules configuration in your build. For example:
    
    
    dependencies {  
        archRules("your:rules:1.0.0")  
    }

As mentioned before, bundled rules will be evaluated automatically. To do this, the runner plugin creates a separate configuration for each of your source sets. In each of these configurations, the archRules classpath is combined with the runtimeClasspath with the arch-rules variant selected. This configuration is the classpath used when the ServiceLoader discovers implementations of ArchRulesService. In the following example, we have a Project which uses a test helper library as a testImplementation dependency, and also adds a standalone rules library to the archRules configuration. The test runtime classpath will only contain the implementation jar for the helper library, but the arch rules runtime will contain the archrules jar for the bundled rules and standalone rules. This all happens automatically.

Gradle configurations used by ArchRules

Once the rules classpath is determined, the runner plugin will create a Gradle work action to evaluate rules against that specific source set. This action runs with classpath isolation using the *archRuleRuntime configuration. Within this action, a ServiceLoader is used to discover rule definitions. The action ends by writing a binary serialization of rule violations to a file for reporting.

In a project running rules, you also have the ability to customize rule configurations using the archRules extension. For example, you can override a rule’s priority level:
    
    
    archRules {  
        ruleClass("com.netflix.nebula.archrules.deprecation") {  
            priority("HIGH")  
        }  
    }

Other [customizations](<https://github.com/nebula-plugins/nebula-archrules-plugin?tab=readme-ov-file#running-rules>) include disabling running rules on certain source sets and configuring the failure threshold (i.e., high priority failures will cause the build to fail).

### Reporting

The ArchRules runner plugin has two built-in reports: JSON and console. The json report will collect the output from all source sets within a project and create a single json file with all of the data. The console report also collects the output from all source sets within a project, but it prints to the console an easy to read report, for example:

Console Report output

Note that failure details feature a detailed plain English description, along with a pointer to the exact line of code in violation.

For custom reporting, you can either use the JSON file, or create your own task that reads the binary files. Take a look at the source code for the ArchRules runner plugin’s report tasks for an example of how to do this.

### Case Study Solution

Going back to our original problem, using ArchRules, we were able to deliver a platform for library authors to track the usage of their APIs. They write ArchRules to detect usage of the annotations, scoped to their library’s package, such as:
    
    
    ArchRuleDefinition.priority(Priority.MEDIUM)  
        .noClasses().that(resideOutsideOfPackage(packageName + ".."))  
        .should()  
        .dependOnClassesThat(resideInAPackage(packageName + "..").and(are(deprecated())))  
        .orShould().accessTargetWhere(targetOwner(resideInAPackage(packageName + ".."))  
            .and(target(is(deprecated())).or(targetOwner(is(deprecated())))))  
        .allowEmptyShould(true)  
        .because("Deprecated APIs are subject to removal");

NB: the deprecated() predicate comes from [nebula-archrules](<https://github.com/nebula-plugins/nebula-archrules/blob/main/archrules-common/src/main/java/com/netflix/nebula/archrules/common/CanBeAnnotated.java>).

Our internal Nebula standard Gradle wrapper and plugin suite automatically enable the ArchRules runner on every project, and provides a custom reporter which sends the report data to our Internal Developer Portal on every main-branch CI build. This way, library authors can easily see a report of all downstream consumers using their experimental, deprecated, or non-public APIs, giving them confidence to make “breaking” changes, knowing that it will not actually break downstream consumers. If their changes are currently blocked by downstream usage, they can easily see exactly which projects are reporting those usages.

### OSS Rule Libraries

While the most powerful way to use ArchRules is for you to write your own rules, we have built some [OSS rule libraries](<https://github.com/nebula-plugins/nebula-archrules>) that anyone is free to use, or reference as examples.

#### Nullability

These rules enforce proper nullability annotation in Java, for example, that every public class is marked with [JSpecify](<https://jspecify.dev/>)’s @NullMarked. It is smart enough to exclude Kotlin code, as Kotlin has built-in nullability.

#### Gradle Plugin Best Practices

[Writing Gradle plugins](<https://docs.gradle.org/current/userguide/writing_plugins.html>) can be hard, especially since there are many APIs and patterns that should not be used anymore. These rules help enforce current best practices when writing Gradle plugins.

#### Joda / Guava Rules

These rule libraries discourage the use of Joda Time and Guava classes (respectively) as these have been superseded by java.time and standard library enhancements.

#### Security Rules

These rules help mitigate CVEs by detecting usage of known vulnerable APIs. Ideally, we keep dependencies up to date to mitigate CVEs. But sometimes that is not immediately feasible, and in those cases, a compile time check to ensure the specific vulnerable API is not used is often good enough.

### Conclusion

We are now running 358 (and counting) rules across over 5,000 repositories detecting over nearly 1 million issues. About 1,000 of these issues are for “High” priority rules. Being able to run these rules on this scale allows us to quickly gain insight into our large fleet of microservices, and identify the areas carrying the most critical technical debt. This makes it easier to focus and prioritize our efforts.

Going forward, we will be exploring how to tie auto-remediation solutions into the ArchRules findings. ArchUnit currently provides very specific and detailed information about failures in reports, which makes a very strong input signal to an auto remediation tool. We will explore deterministic solutions such as [OpenRewrite](<https://docs.openrewrite.org/>) and non-deterministic solutions such as LLMs. Pairing the easy rule authorship and deterministic results of ArchUnit with an auto-remediation tool that can correctly interpret the results to solve the issue at hand will be a very powerful combination.

We also will investigate how to get ArchRule failure information surfaced in the IDE as inspections.

If you have questions or feedback about Nebula ArchRules, reach out to us by posting in the #nebula channel on the [Gradle Community](<http://gradle-community.slack.com>) Slack.

* * *

[Scaling ArchUnit with Nebula ArchRules](<https://netflixtechblog.com/scaling-archunit-with-nebula-archrules-b4642c464c5a>) was originally published in [Netflix TechBlog](<https://netflixtechblog.com>) on Medium, where people are continuing the conversation by highlighting and responding to this story.
