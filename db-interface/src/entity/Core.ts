import {
    Entity,
    Column,
    Index,
    ManyToMany,
    JoinTable,
    OneToMany,
    ManyToOne,
    OneToOne,
    JoinColumn,
    UpdateDateColumn,
    Relation,
    PrimaryColumn,
} from "typeorm";

import { Min } from "class-validator";

import { Base } from "./Base";

/**********************************************************************************************
 *                                     Custom types
 **********************************************************************************************/

export enum UserStatus {
    online = "online",
    offline = "offline",
    in_game = "in_game",
    in_queue = "in_queue",
    afk = "afk",
}

export enum UserMatchRole {
    player_one = "player_one",
    player_two = "player_two",
    guest = "guest",
}

export enum UserChannelRole {
    member = "member",
    admin = "admin",
    owner = "owner",
}

export enum UserChannelStatus {
    pending = "pending",
    accepted = "accepted",
}

export enum ChannelType {
    public = "public",
    private = "private",
    protected = "protected",
    direct = "direct",
}

export enum MapID {
    map1,
    map2,
    map3,
    map4,
}

export enum PaddleID {
    paddle1,
    paddle2,
    paddle3,
    paddle4,
}

export enum MatchStatus {
    pending = "pending",
    requested = "requested",
    live = "live",
    finished = "finished",
}

/**********************************************************************************************
 *                                     Entities
 **********************************************************************************************/

@Entity()
export class Match extends Base {
    

    @Column({ type: "date", nullable: true, default: null })
    finishedAt: Date;

    @Column({ default: false })
    custom: boolean;

    @Column({ unique: true, nullable: true, default: null })
    gameCode: string;

    @Column({ default: 0 })
    score1: number;

    @Column({ default: 0 })
    score2: number;

    @Column({ type: "enum", enum: MatchStatus, default: MatchStatus.pending })
    status: MatchStatus;

    @OneToMany(() => UserMatch, (userMatch: UserMatch) => userMatch.match)
    @JoinTable()
    participants: Relation<UserMatch[]>;

    @ManyToOne(() => User, (user: User) => user.matchesOne, {
        onDelete: "CASCADE",
        nullable: true,
        eager: true,
    })
    playerOne: Relation<User>;

    @ManyToOne(() => User, (user: User) => user.matchesTwo, {
        onDelete: "CASCADE",
        nullable: true,
        eager: true,
    })
    playerTwo: Relation<User>;

    @OneToOne(() => UserMatch, (userMatch: UserMatch) => userMatch.match)
    userMatch: Relation<UserMatch>;
}

@Entity()
export class UserChannel extends Base {
    @Column({ default: "member" })
    role: UserChannelRole;

    // @Column()
    // status: UserChannelStatus;

    @ManyToOne(() => Channel, (channel: Channel) => channel.userChannels, {
        onDelete: "CASCADE",
    })
    channel: Relation<Channel>;

    @ManyToOne(() => User, (user: User) => user.userChannels, {
        onDelete: "CASCADE",
    })
    user: Relation<User>;

    @Column({ default: false })
    muted: boolean;

    @Column({ nullable: true, default: null })
    muteExpiration: string;
    
}

@Entity()
export class BannedChan extends Base 
{
    @Column({type: 'bigint', nullable: true, default: null })
    expirationDate: number;

    @ManyToOne(() => Channel, (channel: Channel) => channel.bannedChans, {
        onDelete: "CASCADE",
    })
    channel: Relation<Channel>;

    @ManyToOne(() => User, (user: User) => user.bannedChans, {
        onDelete: "CASCADE",
    })
    user: Relation<User>;
}



@Entity()
export class Avatar extends Base {
    @Column()
    path: string;

    @OneToOne(() => User, { onDelete: "CASCADE" })
    user: Relation<User>;

    constructor(path: string) {
        super();
        this.path = path;
    }
}

@Entity()
export class UserSettings extends Base {
    @Column({ default: false })
    twoFa: boolean;

    @Column({ default: MapID.map1 })
    mapId: MapID;

    @Column({ default: PaddleID.paddle1 })
    paddleId: PaddleID;

    @OneToOne(() => User, { onDelete: "CASCADE" })
    user: Relation<User>;
}

@Entity()
export class UserStats extends Base {
    @Column({ default: 0 })
    level: number;

    @Column({ default: 0 })
    @Min(0)
    victories: number;

    @Column({ default: 0 })
    @Min(0)
    defeats: number;

    @OneToOne(() => User, { onDelete: "CASCADE" })
    user: Relation<User>;
}

@Entity()
export class User extends Base {
    @PrimaryColumn()
    login: string;

    @Index("username-idx")
    @Column({ unique: true })
    userName: string;

    @Column("boolean", { default: false })
    twoFa: boolean;

    @Column({ nullable: true, default: null })
    globalSocketId: string;

    @Column({ nullable: true, default: null })
    chatSocketId: string;

    @Column({ nullable: true, default: null })
    gameSocketId: string;

	@Column({ nullable: true, default: null })
    twoFaCode: string;

    @Column({ type: "enum", enum: UserStatus, default: UserStatus.offline })
    status: UserStatus;

    @ManyToMany(() => User, { cascade: true })
    @JoinTable()
    friends: User[];

    // @ManyToMany(() => User, { cascade: true })
    // @JoinTable()
    // blockedUser: User[];

    @OneToMany(() => BlockerBlocked, (blockerBlocked: BlockerBlocked) => blockerBlocked.blocked, {
        cascade: true,
    })
    blockerBlockeds: Relation<BlockerBlocked>[];

    // @OneToMany(() => BlockerBlocked, (blockerBlocked: BlockerBlocked) => blockerBlocked.blocker, {
    //     cascade: true,
    // })
    // blockerBlockeds: Relation< BlockerBlocked>[];

    @OneToMany(() => UserMatch, (userMatch: UserMatch) => userMatch.user, {
        cascade: true,
    })
    userMatchs: Relation<UserMatch>[];

    @OneToMany(
        () => UserChannel,
        (userChannel: UserChannel) => userChannel.user,
        {
            cascade: true,
        }
    )
    userChannels: UserChannel[];

    @OneToOne(() => UserStats, (stats: UserStats) => stats.user, {
        // onDelete: "RESTRICT",
        eager: true,
        cascade: true,
    })
    @JoinColumn({ name: "userStatsId", referencedColumnName: "id" })
    stats: UserStats;

    @OneToOne(() => UserSettings, (settings: UserSettings) => settings.user, {
        // onDelete: "RESTRICT",
        cascade: true,
        eager: true,
        nullable: false,
    })
    @JoinColumn()
    settings: UserSettings;

    @OneToOne(() => Avatar, (avatar: Avatar) => avatar.user, {
        cascade: true,
        eager: true,
        nullable: false,
    })
    @JoinColumn()
    avatar: Avatar;

    constructor(login: string) {
        super();

        this.login = login;
        this.userName = login;
        // this.stats = new UserStats();
        // this.settings = new UserSettings();
    }

	@OneToMany(() => Message, (message: Message) => message.sender, {
        cascade: true,
    })
    messages: Relation<Message>[];


	@OneToMany(() => Channel, (channel: Channel) => channel.creator, {
        cascade: true,
    })
    channels: Relation<Channel>[];

    @OneToMany(
        () => BannedChan,
        (bannedChan: BannedChan) => bannedChan.user,
        {
            cascade: true,
        }
    )
    bannedChans: BannedChan[];

    @OneToMany(() => Channel, (channel: Channel) => channel.userOne, {
        cascade: true,
    })
    DMchannelsOne: Relation<Channel>[];


    @OneToMany(() => Channel, (channel: Channel) => channel.userTwo, {
        cascade: true,
    })
    DMchannelsTwo: Relation<Channel>[];


    @OneToMany(() => Match, (match: Match) => match.playerOne, {
        cascade: true,
    })
    matchesOne: Relation<Match>[];

    @OneToMany(() => Match, (match: Match) => match.playerTwo, {
        cascade: true,
    })
    matchesTwo: Relation<Match>[];

}

@Entity()
export class UserMatch extends Base {
    @ManyToOne(() => User, (user: User) => user.userMatchs, {
        onDelete: "CASCADE",
        nullable: false,
        eager: true,
    })
    user: User;

    @ManyToOne(() => Match, (match: Match) => match.participants, {
        onDelete: "CASCADE",
        nullable: false,
    })
    match: Match;

    @Column({ default: 0 })
    @Min(0)
    score: number;

    @Column()
    role: UserMatchRole;
}


@Entity()
export class BlockerBlocked extends Base {
    @ManyToOne(() => User, (user: User) => user.blockerBlockeds, {
        onDelete: "CASCADE",
        nullable: false,
        eager: true,
    })
    blocker: Relation<User>;

    @ManyToOne(() => User, (user: User) => user.blockerBlockeds, {
        onDelete: "CASCADE",
        nullable: false,
        eager: true,
    })
    blocked: Relation<User>;
}

@Entity()
export class Message extends Base 
{
    @UpdateDateColumn()
    updatedAt: Date;

    @Column()
    text: string;

	@ManyToOne(() =>User, (user: User) => user.messages, { onDelete: "CASCADE" })
	// @JoinColumn({name: "sender_id"})   
    sender: Relation<User>

    @ManyToOne(() =>Channel, (channel: Channel) => channel.messages, { onDelete: "CASCADE" })
	// @JoinColumn({name: "channel_id"})   
    channel: Relation<Channel>

}

@Entity()
export class Channel extends Base {

    @Column({ unique: true})
	name: string;

	@Column('boolean', {default: false})
	unremovable: boolean = false;

	@Column({default: ChannelType.public})
    type: ChannelType;

    @Column({ nullable: true, default: null, select: false })
    password: string;

    @OneToMany(
        () => UserChannel,
        (userChannel: UserChannel) => userChannel.channel
    )
    userChannels: UserChannel[];

	@ManyToOne(() => User, (user: User) => user.channels, { onDelete: "CASCADE" })
	// @JoinColumn({name: "creator_id"})   
    creator: Relation<User>

    @OneToMany(() => Message, (message: Message) => message.channel, {
        cascade: true,
    })
	messages: Message[];

    @OneToMany(
        () => BannedChan,
        (bannedChan: BannedChan) => bannedChan.channel
    )
    bannedChans: BannedChan[];


    @ManyToOne(() => User, (user: User) => user.DMchannelsOne, {
        onDelete: "CASCADE",
        nullable: true,
        eager: true,
    })
    userOne: Relation<User>;

    @ManyToOne(() => User, (user: User) => user.DMchannelsTwo, {
        onDelete: "CASCADE",
        nullable: true,
        eager: true,
    })
    userTwo: Relation<User>;

}

