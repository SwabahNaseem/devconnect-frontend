package com.devconnect.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "projects")
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    private LocalDate createdAt;

    // Maximum number of team members (default 4)
    private Integer maxMembers = 4;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "project_skills", joinColumns = @JoinColumn(name = "project_id"))
    @Column(name = "skill")
    private List<String> skills = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lead_id", nullable = false)
    private User lead;

    @ManyToMany
    @JoinTable(
        name = "project_members",
        joinColumns = @JoinColumn(name = "project_id"),
        inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private List<User> members = new ArrayList<>();

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<JoinRequest> joinRequests = new ArrayList<>();

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProjectFile> files = new ArrayList<>();

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Message> messages = new ArrayList<>();

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDate.now();
    }

    // ── No-arg constructor ──
    public Project() {}

    // ── Getters ──
    public Long getId() { return id; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public LocalDate getCreatedAt() { return createdAt; }
    public Integer getMaxMembers() { return maxMembers == null ? 4 : maxMembers; }
    public List<String> getSkills() { return skills; }
    public User getLead() { return lead; }
    public List<User> getMembers() { return members; }
    public List<JoinRequest> getJoinRequests() { return joinRequests; }
    public List<ProjectFile> getFiles() { return files; }
    public List<Message> getMessages() { return messages; }

    // ── Setters ──
    public void setId(Long id) { this.id = id; }
    public void setName(String name) { this.name = name; }
    public void setDescription(String description) { this.description = description; }
    public void setCreatedAt(LocalDate createdAt) { this.createdAt = createdAt; }
    public void setMaxMembers(Integer maxMembers) { this.maxMembers = maxMembers; }
    public void setSkills(List<String> skills) { this.skills = skills; }
    public void setLead(User lead) { this.lead = lead; }
    public void setMembers(List<User> members) { this.members = members; }
    public void setJoinRequests(List<JoinRequest> joinRequests) { this.joinRequests = joinRequests; }
    public void setFiles(List<ProjectFile> files) { this.files = files; }
    public void setMessages(List<Message> messages) { this.messages = messages; }

    // ── Builder ──
    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private String name;
        private String description;
        private List<String> skills = new ArrayList<>();
        private User lead;
        private Integer maxMembers = 4;
        private List<User> members = new ArrayList<>();

        public Builder name(String name) { this.name = name; return this; }
        public Builder description(String description) { this.description = description; return this; }
        public Builder skills(List<String> skills) { this.skills = skills; return this; }
        public Builder lead(User lead) { this.lead = lead; return this; }
        public Builder maxMembers(Integer v) { this.maxMembers = v; return this; }
        public Builder members(List<User> members) { this.members = members; return this; }

        public Project build() {
            Project p = new Project();
            p.name = this.name;
            p.description = this.description;
            p.skills = this.skills;
            p.lead = this.lead;
            p.maxMembers = this.maxMembers;
            p.members = this.members;
            return p;
        }
    }
}
