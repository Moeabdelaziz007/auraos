import { getEnterpriseTeamManager } from './enterprise-team-management.js';

interface CollaborationSession {
  id: string;
  type: 'workflow' | 'automation' | 'document' | 'dashboard';
  resourceId: string;
  resourceName: string;
  teamId: string;
  participants: CollaborationParticipant[];
  permissions: CollaborationPermissions;
  createdAt: Date;
  lastActivity: Date;
  status: 'active' | 'paused' | 'ended';
  metadata: any;
}

interface CollaborationParticipant {
  userId: string;
  name: string;
  email: string;
  role: string;
  joinedAt: Date;
  lastSeen: Date;
  cursorPosition?: CursorPosition;
  isActive: boolean;
  permissions: string[];
}

interface CursorPosition {
  line: number;
  column: number;
  selectionStart?: number;
  selectionEnd?: number;
}

interface CollaborationPermissions {
  canEdit: boolean;
  canComment: boolean;
  canInvite: boolean;
  canViewHistory: boolean;
  canExport: boolean;
}

interface CollaborationComment {
  id: string;
  sessionId: string;
  userId: string;
  userName: string;
  content: string;
  position?: {
    line: number;
    column: number;
  };
  type: 'comment' | 'suggestion' | 'question' | 'approval';
  status: 'open' | 'resolved' | 'dismissed';
  createdAt: Date;
  updatedAt: Date;
  replies: CollaborationReply[];
}

interface CollaborationReply {
  id: string;
  commentId: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: Date;
}

interface CollaborationChange {
  id: string;
  sessionId: string;
  userId: string;
  userName: string;
  type: 'insert' | 'delete' | 'modify' | 'move';
  position: {
    line: number;
    column: number;
  };
  content: string;
  previousContent?: string;
  timestamp: Date;
  version: number;
}

interface CollaborationInvitation {
  id: string;
  sessionId: string;
  invitedUserId: string;
  invitedUserEmail: string;
  invitedBy: string;
  permissions: CollaborationPermissions;
  message?: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  createdAt: Date;
  expiresAt: Date;
}

interface CollaborationNotification {
  id: string;
  userId: string;
  type: 'invitation' | 'comment' | 'change' | 'mention' | 'approval';
  title: string;
  message: string;
  sessionId?: string;
  resourceId?: string;
  read: boolean;
  createdAt: Date;
  metadata: any;
}

/**
 * Manages enterprise collaboration, including real-time editing, comments, and notifications.
 */
export class EnterpriseCollaborationSystem {
  private sessions: Map<string, CollaborationSession> = new Map();
  private comments: Map<string, CollaborationComment[]> = new Map();
  private changes: Map<string, CollaborationChange[]> = new Map();
  private invitations: Map<string, CollaborationInvitation[]> = new Map();
  private notifications: Map<string, CollaborationNotification[]> = new Map();
  private activeConnections: Map<string, any> = new Map();
  private subscribers: Set<any> = new Set();

  /**
   * Creates an instance of EnterpriseCollaborationSystem.
   */
  constructor() {
    this.startCollaborationMonitoring();
  }

  private startCollaborationMonitoring() {
    console.log('🤝 Enterprise Collaboration System started');
    
    // Clean up expired sessions every 5 minutes
    setInterval(() => {
      this.cleanupExpiredSessions();
    }, 300000);

    // Clean up expired invitations every minute
    setInterval(() => {
      this.cleanupExpiredInvitations();
    }, 60000);
  }

  /**
   * Creates a new collaboration session.
   * @param {CollaborationSession['type']} type The type of the collaboration session.
   * @param {string} resourceId The ID of the resource being collaborated on.
   * @param {string} resourceName The name of the resource being collaborated on.
   * @param {string} teamId The ID of the team the collaboration session belongs to.
   * @param {string} creatorId The ID of the user creating the collaboration session.
   * @param {CollaborationPermissions} permissions The permissions for the collaboration session.
   * @returns {Promise<CollaborationSession>} A promise that resolves with the newly created collaboration session.
   */
  async createCollaborationSession(
    type: CollaborationSession['type'],
    resourceId: string,
    resourceName: string,
    teamId: string,
    creatorId: string,
    permissions: CollaborationPermissions
  ): Promise<CollaborationSession> {
    const teamManager = getEnterpriseTeamManager();
    const team = await teamManager.getTeam(teamId);
    
    if (!team) {
      throw new Error('Team not found');
    }

    // Check if user has permission to create collaboration sessions
    const canCreate = await teamManager.checkPermission(creatorId, teamId, 'create_workflows');
    if (!canCreate) {
      throw new Error('Insufficient permissions to create collaboration session');
    }

    const session: CollaborationSession = {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      resourceId,
      resourceName,
      teamId,
      participants: [],
      permissions,
      createdAt: new Date(),
      lastActivity: new Date(),
      status: 'active',
      metadata: {
        version: 1,
        autoSave: true,
        conflictResolution: 'last_write_wins'
      }
    };

    // Add creator as first participant
    const creator = await this.addParticipantToSession(session.id, creatorId, teamId, permissions);
    session.participants.push(creator);

    this.sessions.set(session.id, session);
    this.comments.set(session.id, []);
    this.changes.set(session.id, []);
    this.invitations.set(session.id, []);

    console.log(`🤝 Collaboration session created: ${resourceName} (${type})`);
    this.broadcastSessionUpdate(session);
    
    return session;
  }

  /**
   * Joins a collaboration session.
   * @param {string} sessionId The ID of the collaboration session to join.
   * @param {string} userId The ID of the user joining the session.
   * @param {string} teamId The ID of the team the user belongs to.
   * @returns {Promise<CollaborationParticipant>} A promise that resolves with the participant information.
   */
  async joinCollaborationSession(
    sessionId: string,
    userId: string,
    teamId: string
  ): Promise<CollaborationParticipant> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Collaboration session not found');
    }

    if (session.status !== 'active') {
      throw new Error('Collaboration session is not active');
    }

    // Check if user is already a participant
    const existingParticipant = session.participants.find(p => p.userId === userId);
    if (existingParticipant) {
      existingParticipant.lastSeen = new Date();
      existingParticipant.isActive = true;
      this.broadcastParticipantUpdate(session, existingParticipant);
      return existingParticipant;
    }

    // Check team membership and permissions
    const teamManager = getEnterpriseTeamManager();
    const canJoin = await teamManager.checkPermission(userId, teamId, 'create_workflows');
    if (!canJoin) {
      throw new Error('Insufficient permissions to join collaboration session');
    }

    // Add as new participant
    const participant = await this.addParticipantToSession(sessionId, userId, teamId, session.permissions);
    session.participants.push(participant);
    session.lastActivity = new Date();

    console.log(`👤 User joined collaboration session: ${userId}`);
    this.broadcastParticipantUpdate(session, participant);
    this.broadcastSessionUpdate(session);

    return participant;
  }

  /**
   * Leaves a collaboration session.
   * @param {string} sessionId The ID of the collaboration session to leave.
   * @param {string} userId The ID of the user leaving the session.
   * @returns {Promise<boolean>} A promise that resolves with true if the user left the session, false otherwise.
   */
  async leaveCollaborationSession(sessionId: string, userId: string): Promise<boolean> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Collaboration session not found');
    }

    const participantIndex = session.participants.findIndex(p => p.userId === userId);
    if (participantIndex === -1) {
      throw new Error('User is not a participant in this session');
    }

    session.participants[participantIndex].isActive = false;
    session.participants[participantIndex].lastSeen = new Date();
    session.lastActivity = new Date();

    console.log(`👤 User left collaboration session: ${userId}`);
    this.broadcastParticipantUpdate(session, session.participants[participantIndex]);

    // If no active participants, pause session
    const activeParticipants = session.participants.filter(p => p.isActive);
    if (activeParticipants.length === 0) {
      session.status = 'paused';
      this.broadcastSessionUpdate(session);
    }

    return true;
  }

  private async addParticipantToSession(
    sessionId: string,
    userId: string,
    teamId: string,
    permissions: CollaborationPermissions
  ): Promise<CollaborationParticipant> {
    const teamManager = getEnterpriseTeamManager();
    const team = await teamManager.getTeam(teamId);
    const member = team?.members.find(m => m.userId === userId);

    return {
      userId,
      name: member?.name || 'Unknown User',
      email: member?.email || 'unknown@example.com',
      role: member?.role.name || 'user',
      joinedAt: new Date(),
      lastSeen: new Date(),
      isActive: true,
      permissions: member?.permissions || []
    };
  }

  /**
   * Updates a user's cursor position in a collaboration session.
   * @param {string} sessionId The ID of the collaboration session.
   * @param {string} userId The ID of the user.
   * @param {CursorPosition} position The new cursor position.
   * @returns {Promise<boolean>} A promise that resolves with true if the cursor position was updated, false otherwise.
   */
  async updateCursorPosition(
    sessionId: string,
    userId: string,
    position: CursorPosition
  ): Promise<boolean> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return false;
    }

    const participant = session.participants.find(p => p.userId === userId);
    if (!participant) {
      return false;
    }

    participant.cursorPosition = position;
    participant.lastSeen = new Date();

    // Broadcast cursor update to other participants
    this.broadcastCursorUpdate(session, participant);
    return true;
  }

  /**
   * Makes a change in a collaboration session.
   * @param {string} sessionId The ID of the collaboration session.
   * @param {string} userId The ID of the user making the change.
   * @param {Omit<CollaborationChange, 'id' | 'userId' | 'userName' | 'timestamp' | 'version'>} change The change to make.
   * @returns {Promise<CollaborationChange>} A promise that resolves with the new change.
   */
  async makeChange(
    sessionId: string,
    userId: string,
    change: Omit<CollaborationChange, 'id' | 'userId' | 'userName' | 'timestamp' | 'version'>
  ): Promise<CollaborationChange> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Collaboration session not found');
    }

    const participant = session.participants.find(p => p.userId === userId);
    if (!participant) {
      throw new Error('User is not a participant in this session');
    }

    // Check edit permissions
    if (!session.permissions.canEdit && !participant.permissions.includes('modify_workflows')) {
      throw new Error('Insufficient permissions to make changes');
    }

    const sessionChanges = this.changes.get(sessionId) || [];
    const newVersion = sessionChanges.length + 1;

    const collaborationChange: CollaborationChange = {
      id: `change_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sessionId,
      userId,
      userName: participant.name,
      version: newVersion,
      timestamp: new Date(),
      ...change
    };

    sessionChanges.push(collaborationChange);
    this.changes.set(sessionId, sessionChanges);
    session.lastActivity = new Date();
    session.metadata.version = newVersion;

    console.log(`✏️ Change made in collaboration session: ${session.resourceName}`);
    this.broadcastChangeUpdate(session, collaborationChange);
    this.broadcastSessionUpdate(session);

    return collaborationChange;
  }

  /**
   * Adds a comment to a collaboration session.
   * @param {string} sessionId The ID of the collaboration session.
   * @param {string} userId The ID of the user adding the comment.
   * @param {string} content The content of the comment.
   * @param {CollaborationComment['type']} [type='comment'] The type of the comment.
   * @param {{ line: number; column: number; }} [position] The position of the comment.
   * @returns {Promise<CollaborationComment>} A promise that resolves with the newly created comment.
   */
  async addComment(
    sessionId: string,
    userId: string,
    content: string,
    type: CollaborationComment['type'] = 'comment',
    position?: { line: number; column: number }
  ): Promise<CollaborationComment> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Collaboration session not found');
    }

    const participant = session.participants.find(p => p.userId === userId);
    if (!participant) {
      throw new Error('User is not a participant in this session');
    }

    // Check comment permissions
    if (!session.permissions.canComment && !participant.permissions.includes('modify_workflows')) {
      throw new Error('Insufficient permissions to add comments');
    }

    const sessionComments = this.comments.get(sessionId) || [];
    
    const comment: CollaborationComment = {
      id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sessionId,
      userId,
      userName: participant.name,
      content,
      position,
      type,
      status: 'open',
      createdAt: new Date(),
      updatedAt: new Date(),
      replies: []
    };

    sessionComments.push(comment);
    this.comments.set(sessionId, sessionComments);
    session.lastActivity = new Date();

    console.log(`💬 Comment added to collaboration session: ${session.resourceName}`);
    this.broadcastCommentUpdate(session, comment);

    // Create notification for other participants
    this.createNotificationForParticipants(session, {
      type: 'comment',
      title: 'New Comment',
      message: `${participant.name} added a ${type}`,
      sessionId,
      metadata: { commentId: comment.id }
    });

    return comment;
  }

  /**
   * Replies to a comment.
   * @param {string} commentId The ID of the comment to reply to.
   * @param {string} userId The ID of the user replying.
   * @param {string} content The content of the reply.
   * @returns {Promise<CollaborationReply>} A promise that resolves with the newly created reply.
   */
  async replyToComment(
    commentId: string,
    userId: string,
    content: string
  ): Promise<CollaborationReply> {
    const sessionComments = Array.from(this.comments.values()).flat();
    const comment = sessionComments.find(c => c.id === commentId);
    
    if (!comment) {
      throw new Error('Comment not found');
    }

    const session = this.sessions.get(comment.sessionId);
    const participant = session?.participants.find(p => p.userId === userId);
    
    if (!participant) {
      throw new Error('User is not a participant in this session');
    }

    const reply: CollaborationReply = {
      id: `reply_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      commentId,
      userId,
      userName: participant.name,
      content,
      createdAt: new Date()
    };

    comment.replies.push(reply);
    comment.updatedAt = new Date();

    console.log(`💬 Reply added to comment: ${commentId}`);
    this.broadcastReplyUpdate(comment, reply);

    return reply;
  }

  /**
   * Invites a user to a collaboration session.
   * @param {string} sessionId The ID of the collaboration session.
   * @param {string} invitedUserEmail The email of the user to invite.
   * @param {string} invitedBy The ID of the user sending the invitation.
   * @param {CollaborationPermissions} permissions The permissions for the invited user.
   * @param {string} [message] An optional message to include with the invitation.
   * @returns {Promise<CollaborationInvitation>} A promise that resolves with the created invitation.
   */
  async inviteToSession(
    sessionId: string,
    invitedUserEmail: string,
    invitedBy: string,
    permissions: CollaborationPermissions,
    message?: string
  ): Promise<CollaborationInvitation> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Collaboration session not found');
    }

    const inviter = session.participants.find(p => p.userId === invitedBy);
    if (!inviter) {
      throw new Error('User is not a participant in this session');
    }

    // Check invite permissions
    if (!session.permissions.canInvite && !inviter.permissions.includes('manage_team')) {
      throw new Error('Insufficient permissions to invite users');
    }

    const invitation: CollaborationInvitation = {
      id: `invite_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sessionId,
      invitedUserId: '', // Will be set when user accepts
      invitedUserEmail,
      invitedBy,
      permissions,
      message,
      status: 'pending',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    };

    const sessionInvitations = this.invitations.get(sessionId) || [];
    sessionInvitations.push(invitation);
    this.invitations.set(sessionId, sessionInvitations);

    console.log(`📧 Invitation sent to: ${invitedUserEmail}`);
    
    // Create notification for invited user
    this.createNotification({
      userId: invitedUserEmail, // Using email as userId for now
      type: 'invitation',
      title: 'Collaboration Invitation',
      message: `You've been invited to collaborate on ${session.resourceName}`,
      sessionId,
      metadata: { invitationId: invitation.id }
    });

    return invitation;
  }

  // Notifications
  private createNotification(notificationData: Omit<CollaborationNotification, 'id' | 'read' | 'createdAt'>): void {
    const notification: CollaborationNotification = {
      id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      read: false,
      createdAt: new Date(),
      ...notificationData
    };

    const userNotifications = this.notifications.get(notification.userId) || [];
    userNotifications.push(notification);
    this.notifications.set(notification.userId, userNotifications);

    this.broadcastNotification(notification);
  }

  private createNotificationForParticipants(
    session: CollaborationSession,
    notificationData: Omit<CollaborationNotification, 'id' | 'userId' | 'read' | 'createdAt'>
  ): void {
    session.participants.forEach(participant => {
      this.createNotification({
        ...notificationData,
        userId: participant.userId
      });
    });
  }

  // Utility Methods
  private cleanupExpiredSessions(): void {
    const now = Date.now();
    const expiredTime = 30 * 60 * 1000; // 30 minutes

    for (const [sessionId, session] of this.sessions.entries()) {
      if (now - session.lastActivity.getTime() > expiredTime && session.status === 'active') {
        session.status = 'paused';
        console.log(`⏸️ Session paused due to inactivity: ${session.resourceName}`);
        this.broadcastSessionUpdate(session);
      }
    }
  }

  private cleanupExpiredInvitations(): void {
    const now = Date.now();

    for (const [sessionId, invitations] of this.invitations.entries()) {
      const activeInvitations = invitations.filter(invite => {
        if (invite.expiresAt.getTime() < now && invite.status === 'pending') {
          invite.status = 'expired';
          return false;
        }
        return true;
      });
      this.invitations.set(sessionId, activeInvitations);
    }
  }

  /**
   * Gets a collaboration session by its ID.
   * @param {string} sessionId The ID of the collaboration session to get.
   * @returns {Promise<CollaborationSession | null>} A promise that resolves with the collaboration session, or null if not found.
   */
  async getSession(sessionId: string): Promise<CollaborationSession | null> {
    return this.sessions.get(sessionId) || null;
  }

  /**
   * Gets all collaboration sessions for a user.
   * @param {string} userId The ID of the user.
   * @returns {Promise<CollaborationSession[]>} A promise that resolves with a list of collaboration sessions.
   */
  async getUserSessions(userId: string): Promise<CollaborationSession[]> {
    const userSessions: CollaborationSession[] = [];
    
    for (const session of this.sessions.values()) {
      const participant = session.participants.find(p => p.userId === userId);
      if (participant) {
        userSessions.push(session);
      }
    }

    return userSessions;
  }

  /**
   * Gets all comments for a collaboration session.
   * @param {string} sessionId The ID of the collaboration session.
   * @returns {Promise<CollaborationComment[]>} A promise that resolves with a list of comments.
   */
  async getSessionComments(sessionId: string): Promise<CollaborationComment[]> {
    return this.comments.get(sessionId) || [];
  }

  /**
   * Gets all changes for a collaboration session.
   * @param {string} sessionId The ID of the collaboration session.
   * @returns {Promise<CollaborationChange[]>} A promise that resolves with a list of changes.
   */
  async getSessionChanges(sessionId: string): Promise<CollaborationChange[]> {
    return this.changes.get(sessionId) || [];
  }

  /**
   * Gets all notifications for a user.
   * @param {string} userId The ID of the user.
   * @returns {Promise<CollaborationNotification[]>} A promise that resolves with a list of notifications.
   */
  async getUserNotifications(userId: string): Promise<CollaborationNotification[]> {
    return this.notifications.get(userId) || [];
  }

  /**
   * Marks a notification as read.
   * @param {string} userId The ID of the user.
   * @param {string} notificationId The ID of the notification to mark as read.
   * @returns {Promise<boolean>} A promise that resolves with true if the notification was marked as read, false otherwise.
   */
  async markNotificationAsRead(userId: string, notificationId: string): Promise<boolean> {
    const notifications = this.notifications.get(userId);
    if (!notifications) {
      return false;
    }

    const notification = notifications.find(n => n.id === notificationId);
    if (!notification) {
      return false;
    }

    notification.read = true;
    return true;
  }

  /**
   * Subscribes to updates from the collaboration system.
   * @param {(update: any) => void} callback The callback to call with updates.
   * @returns {() => void} A function to unsubscribe.
   */
  subscribeToUpdates(callback: (update: any) => void): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  private broadcastSessionUpdate(session: CollaborationSession): void {
    const update = {
      type: 'session_update',
      data: session,
      timestamp: Date.now()
    };

    this.subscribers.forEach(callback => {
      try {
        callback(update);
      } catch (error) {
        console.error('Error broadcasting session update:', error);
      }
    });
  }

  private broadcastParticipantUpdate(session: CollaborationSession, participant: CollaborationParticipant): void {
    const update = {
      type: 'participant_update',
      data: { sessionId: session.id, participant },
      timestamp: Date.now()
    };

    this.subscribers.forEach(callback => {
      try {
        callback(update);
      } catch (error) {
        console.error('Error broadcasting participant update:', error);
      }
    });
  }

  private broadcastCursorUpdate(session: CollaborationSession, participant: CollaborationParticipant): void {
    const update = {
      type: 'cursor_update',
      data: { sessionId: session.id, participant },
      timestamp: Date.now()
    };

    this.subscribers.forEach(callback => {
      try {
        callback(update);
      } catch (error) {
        console.error('Error broadcasting cursor update:', error);
      }
    });
  }

  private broadcastChangeUpdate(session: CollaborationSession, change: CollaborationChange): void {
    const update = {
      type: 'change_update',
      data: { sessionId: session.id, change },
      timestamp: Date.now()
    };

    this.subscribers.forEach(callback => {
      try {
        callback(update);
      } catch (error) {
        console.error('Error broadcasting change update:', error);
      }
    });
  }

  private broadcastCommentUpdate(session: CollaborationSession, comment: CollaborationComment): void {
    const update = {
      type: 'comment_update',
      data: { sessionId: session.id, comment },
      timestamp: Date.now()
    };

    this.subscribers.forEach(callback => {
      try {
        callback(update);
      } catch (error) {
        console.error('Error broadcasting comment update:', error);
      }
    });
  }

  private broadcastReplyUpdate(comment: CollaborationComment, reply: CollaborationReply): void {
    const update = {
      type: 'reply_update',
      data: { commentId: comment.id, reply },
      timestamp: Date.now()
    };

    this.subscribers.forEach(callback => {
      try {
        callback(update);
      } catch (error) {
        console.error('Error broadcasting reply update:', error);
      }
    });
  }

  private broadcastNotification(notification: CollaborationNotification): void {
    const update = {
      type: 'notification',
      data: notification,
      timestamp: Date.now()
    };

    this.subscribers.forEach(callback => {
      try {
        callback(update);
      } catch (error) {
        console.error('Error broadcasting notification:', error);
      }
    });
  }
}

// Export singleton instance
let enterpriseCollaborationSystem: EnterpriseCollaborationSystem | null = null;

/**
 * Gets the singleton instance of the EnterpriseCollaborationSystem.
 * @returns {EnterpriseCollaborationSystem} The singleton instance of the EnterpriseCollaborationSystem.
 */
export function getEnterpriseCollaborationSystem(): EnterpriseCollaborationSystem {
  if (!enterpriseCollaborationSystem) {
    enterpriseCollaborationSystem = new EnterpriseCollaborationSystem();
  }
  return enterpriseCollaborationSystem;
}
