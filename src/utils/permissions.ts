import { GuildMember, APIInteractionGuildMember, PermissionFlagsBits } from 'discord.js';

/**
 * Vérifie si un membre fait partie du staff
 */
export function isStaffMember(
  member: GuildMember | APIInteractionGuildMember | null,
  staffRoleIds: string[]
): boolean {
  if (!member) return false;

  // Si c'est un APIInteractionGuildMember, on vérifie les rôles via roles (array de strings)
  if ('roles' in member && Array.isArray(member.roles)) {
    return member.roles.some((roleId) => staffRoleIds.includes(roleId));
  }

  // Si c'est un GuildMember, on utilise la collection roles.cache
  if ('roles' in member && 'cache' in member.roles) {
    return member.roles.cache.some((role) => staffRoleIds.includes(role.id));
  }

  return false;
}

/**
 * Vérifie si un membre est administrateur
 */
export function isAdmin(member: GuildMember | APIInteractionGuildMember | null): boolean {
  if (!member) return false;

  // APIInteractionGuildMember
  if ('permissions' in member && typeof member.permissions === 'string') {
    const permissions = BigInt(member.permissions);
    return (permissions & PermissionFlagsBits.Administrator) === PermissionFlagsBits.Administrator;
  }

  // GuildMember
  if ('permissions' in member && typeof member.permissions !== 'string') {
    return member.permissions.has(PermissionFlagsBits.Administrator);
  }

  return false;
}

/**
 * Vérifie si un membre est le propriétaire du serveur
 */
export function isOwner(member: GuildMember | null, ownerId: string): boolean {
  if (!member) return false;
  return member.id === ownerId;
}

