import { Request, Response, Router } from "express";
import { requireAuth } from "../security";
import { PermissionService } from "../services/permissionService";
import { db } from "../db";
import { eq, and } from "drizzle-orm";
import { 
  permissionGroups, 
  systemFeatures, 
  groupPermissions,
  userPermissionGroups 
} from "@shared/schema";

export const permissionRoutes = Router();

// Initialize features and groups
permissionRoutes.post("/initialize", requireAuth, async (req: Request, res: Response) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }

    console.log("Starting permission initialization...");
    
    try {
      await PermissionService.initializeFeatures();
      console.log("Features initialized successfully");
    } catch (featuresError) {
      console.error("Error initializing features:", featuresError);
      throw featuresError;
    }
    
    try {
      await PermissionService.initializeGroups();
      console.log("Groups initialized successfully");
    } catch (groupsError) {
      console.error("Error initializing groups:", groupsError);
      throw groupsError;
    }

    res.json({ message: "Permissions system initialized successfully" });
  } catch (error) {
    console.error("Error initializing permissions:", error);
    res.status(500).json({ error: "Failed to initialize permissions", details: error instanceof Error ? error.message : String(error) });
  }
});

// Check user access to a feature
permissionRoutes.get("/check/:featureCode", requireAuth, async (req: Request, res: Response) => {
  try {
    const { featureCode } = req.params;
    const hasAccess = await PermissionService.hasAccess(req.user!.id, featureCode);
    
    res.json({ hasAccess });
  } catch (error) {
    console.error("Error checking permissions:", error);
    res.status(500).json({ error: "Failed to check permissions" });
  }
});

// Get user's accessible features
permissionRoutes.get("/user-features", requireAuth, async (req: Request, res: Response) => {
  try {
    const features = await PermissionService.getUserFeatures(req.user!.id);
    res.json({ features });
  } catch (error) {
    console.error("Error getting user features:", error);
    res.status(500).json({ error: "Failed to get user features" });
  }
});

// Get user's current group
permissionRoutes.get("/user-group", requireAuth, async (req: Request, res: Response) => {
  try {
    const group = await PermissionService.getUserGroup(req.user!.id);
    res.json({ group });
  } catch (error) {
    console.error("Error getting user group:", error);
    res.status(500).json({ error: "Failed to get user group" });
  }
});

// Get all features (admin only)
permissionRoutes.get("/features", requireAuth, async (req: Request, res: Response) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }

    const features = await PermissionService.getAllFeatures();
    res.json({ features });
  } catch (error) {
    console.error("Error getting features:", error);
    res.status(500).json({ error: "Failed to get features" });
  }
});

// Get all groups (admin only)
permissionRoutes.get("/groups", requireAuth, async (req: Request, res: Response) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }

    const groups = await PermissionService.getGroups();
    res.json({ groups });
  } catch (error) {
    console.error("Error getting groups:", error);
    res.status(500).json({ error: "Failed to get groups" });
  }
});

// Get group permissions (admin only)
permissionRoutes.get("/groups/:groupId/permissions", requireAuth, async (req: Request, res: Response) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }

    const groupId = parseInt(req.params.groupId);
    const permissions = await PermissionService.getGroupPermissions(groupId);
    res.json({ permissions });
  } catch (error) {
    console.error("Error getting group permissions:", error);
    res.status(500).json({ error: "Failed to get group permissions" });
  }
});

// Update group permissions (admin only)
permissionRoutes.put("/groups/:groupId/permissions", requireAuth, async (req: Request, res: Response) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }

    const groupId = parseInt(req.params.groupId);
    const { permissions } = req.body;

    await PermissionService.updateGroupPermissions(groupId, permissions);
    res.json({ message: "Permissions updated successfully" });
  } catch (error) {
    console.error("Error updating group permissions:", error);
    res.status(500).json({ error: "Failed to update group permissions" });
  }
});

// Assign user to group (admin only)
permissionRoutes.post("/users/:userId/group", requireAuth, async (req: Request, res: Response) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }

    const userId = parseInt(req.params.userId);
    const { groupId } = req.body;

    await PermissionService.assignUserToGroup(userId, groupId, req.user.id);
    res.json({ message: "User assigned to group successfully" });
  } catch (error) {
    console.error("Error assigning user to group:", error);
    res.status(500).json({ error: "Failed to assign user to group" });
  }
});

// Get all users with their groups (admin only)
permissionRoutes.get("/users-groups", requireAuth, async (req: Request, res: Response) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }

    const usersWithGroups = await db
      .select({
        userId: userPermissionGroups.userId,
        groupId: userPermissionGroups.groupId,
        groupName: permissionGroups.name,
        groupDescription: permissionGroups.description,
        assignedAt: userPermissionGroups.assignedAt
      })
      .from(userPermissionGroups)
      .innerJoin(permissionGroups, eq(permissionGroups.id, userPermissionGroups.groupId))
      .orderBy(userPermissionGroups.userId);

    res.json({ usersWithGroups });
  } catch (error) {
    console.error("Error getting users with groups:", error);
    res.status(500).json({ error: "Failed to get users with groups" });
  }
});