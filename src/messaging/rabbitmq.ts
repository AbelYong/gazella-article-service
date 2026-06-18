import amqp from "amqplib";

// We need to import exact types or TypeScript will confuse amqp's types
type AmqpConnection = Awaited<ReturnType<typeof amqp.connect>>;
type AmqpChannel = Awaited<ReturnType<AmqpConnection["createChannel"]>>;

export const ARTICLES_EXCHANGE: string = "article_events";

export class RabbitMQPublisherService {
    private connection: AmqpConnection | null = null;
    private channel: AmqpChannel | null = null;

    constructor(private readonly url: string, private readonly reconnectTimeout: number) {
        this.url = url;
        this.reconnectTimeout = reconnectTimeout;
    }

    public async connect(): Promise<void> {
        if (this.connection) {
            return;
        }

        try {
            console.log("[RabbitMQ Publisher] Connecting to RabbitMQ");
            
            const conn = await amqp.connect(this.url);
            this.connection = conn;
            
            conn.on("error", (err: Error) => {
                console.error("[RabbitMQ Publisher] Failed to connect to RabbitMQ: ", err.message);
            });

            conn.on("close", () => {
                console.warn('[RabbitMQ Publisher] Connection has been closed. Attempting reconnect...');
                this.connection = null;
                this.channel = null;
                this.scheduleReconnect();
            });

            console.log("[RabbitMQ Publisher] Connection succesfully established");
            await this.createChannel();
        } catch (error) {
            console.error("[RabbitMQ Publisher] Failed to connect, retrying...", (error as Error).message);
            this.scheduleReconnect();
        }
    }

    /**
     * Returns the current active channel. Use to publish or listen to incoming messages.
     */
    private async createChannel(): Promise<void> {
        const conn = this.connection;
        if (!conn) {
            return;
        }

        try {
            const ch = await conn.createChannel();
            this.channel = ch;

            await this.setupTopology(ch);
            
            ch.on("error", (err: Error) => {
                console.error("[RabbitMQ Publisher] Error on the channel:", err.message);
            });

            ch.on("close", () => {
                console.warn("[RabbitMQ Publisher] The channel has been closed");
                if (this.connection) {
                    this.connection.close(); 
                }
            });

            console.log("[RabbitMQ Publisher] Channel succesfully created");
        } catch (error) {
            console.error("[RabbitMQ Publisher] Failed to create the Channel", (error as Error).message);
            if (this.connection) {
                this.connection.close();
            }
        }
    }

    private async setupTopology(channel: amqp.Channel) : Promise<void> {
        await channel.assertExchange(ARTICLES_EXCHANGE, "topic", { durable: true });

        console.log("[RabbitMQ Publisher] Topology configured (Exchange only)");
    }

    /**
     * Publishes an event to the articles exchange.
     * @param routingKey The routing key (eg. "article.published")
     * @param message The object to send (previous JSON serialization is not required)
     */
    public publish(routingKey: string, message: any): boolean {
        if (!this.channel) {
            console.error("[RabbitMQ Publisher] Cannot publish message, channel is not initialized.");
            return false;
        }

        try {
            const content = Buffer.from(JSON.stringify(message));
            
            const sent = this.channel.publish(ARTICLES_EXCHANGE, routingKey, content, {
                persistent: true 
            });

            if (sent) {
                console.log(`[RabbitMQ Publisher] Message sent to [${routingKey}]`);
            } else {
                console.warn(`[RabbitMQ Publisher] Message to [${routingKey}] buffered, channel might be congested.`);
            }
            
            return sent;
        } catch (error) {
            console.error(`[RabbitMQ Publisher] Failed to publish message to [${routingKey}]:`, error);
            return false;
        }
    }

    private scheduleReconnect(): void {
        setTimeout(() => {
            this.connect();
        }, this.reconnectTimeout);
    }

    public getChannel(): AmqpChannel {
        if (!this.channel) {
            throw new Error("The RabbitMQ channel has not been initialized, please call connect() first.");
        }
        return this.channel;
    }

    public async close(): Promise<void> {
        try {
            if (this.channel) {
                await this.channel.close();
            }
            if (this.connection) {
                await this.connection.close();
            }
            console.log("[RabbitMQ Publisher] Disconnected gracefully");
        } catch (error: any) {
            if (error.message !== "Connection closing") {
                console.error("[RabbitMQ Publisher] Error on closing connection", error);
            }
        }
    }
}

export const rabbitMQPublisher = new RabbitMQPublisherService(process.env["RABBITMQ_URL"] || "amqp://localhost:5672", 5000);
