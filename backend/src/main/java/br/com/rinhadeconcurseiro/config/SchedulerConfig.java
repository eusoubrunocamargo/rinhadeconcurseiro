package br.com.rinhadeconcurseiro.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;

@Configuration
@EnableScheduling
public class SchedulerConfig {

    // O ThreadPoolTaskScheduler gerencia um pool de threads dedicado
    // às tarefas agendadas. O tamanho 5 é suficiente para o volume
    // esperado — cada tarefa dura apenas 5 segundos e libera a thread.
    @Bean
    public ThreadPoolTaskScheduler taskScheduler(){
        ThreadPoolTaskScheduler scheduler = new ThreadPoolTaskScheduler();
        scheduler.setPoolSize(5);
        scheduler.setThreadNamePrefix("duelo-scheduler-");
        scheduler.initialize();
        return scheduler;
    }
}
